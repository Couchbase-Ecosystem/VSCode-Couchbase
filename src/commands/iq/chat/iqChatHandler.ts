import { WebviewView } from "vscode";
import { logger } from "../../../logger/logger";
import { CacheService } from "../../../util/cacheService/cacheService";
import { Memory } from "../../../util/util";
import { iqRestApiService } from "../iqRestApiService";
import { actionIntenthandler } from "./intents/actionIntent";
import { collectionIntentHandler } from "./intents/collectionSchemaIntent";
import { IAdditionalContext, IIqStoredMessages, feedbackLambdaMessageType, iqChatResult, iqChatType } from "./types";
import { availableActions, availableCollections, getSelectedCode, jsonParser } from "./utils";
import * as vscode from 'vscode';
import { getFinalResponsePrompt, systemMessagePrompt } from "./prompts";


const getIntentOrResponse = async (userRequest: string, jwtToken: string, orgId: string, cacheService: CacheService, previousMessages: IIqStoredMessages) => {

    // get all collections from cache
    const availableCollectionNames = await availableCollections(cacheService);

    const basicQuestion = `
    You should do the following with the user message:
    1 -  Identify if the user is talking about potential document ids
    2 -  Identify the name of potential couchbase collections. Note that the user might not say “collection” explicitly in the phrase. Here are some of collections in scope.collection format: ${availableCollectionNames}
    3 - Identify if the user is mentioning to files in his project (Classes, methods, functions) 
    4 - If the user intents to execute an action, check if it matches one of the following actionOptions: ${availableActions}. These are the only actions available, no other action should be output
    5 - Return the response in the following JSON Format: 
    {  
      “Ids”: <Array Of Strings with the identified document ids>,  
      “collections”: <Array Of Strings with the identified Collections>,
      “files”: <Array Of Strings with the identified files>, 
      “func”: <Array Of Strings with the identified functions or methods>,
      “actions”: <array of actions recognized according to the values of actionOptions>
    }
    If any additional information is needed, respond in the JSON format listed above.
    Do not add any non-json text to your response with JSON.
    `;

    const userQuestion = `
        Here is the question asked by user: 
        ${userRequest}
    `;

    const codeSelected = getSelectedCode();

    const finalContent = basicQuestion + userQuestion + codeSelected;

    const messagesPayload = [{ // Add system prompt for IQ
        role: "system",
        content: systemMessagePrompt
    },
    ...previousMessages.allChats.filter((msg) => msg.role !== "system" && msg.isIntent !== true), {
        role: "user",
        content: finalContent
    }];

    previousMessages.allChats = [...previousMessages.allChats, {
        role: "system",
        content: finalContent,
    }];

    const payload = {
        completionSettings: {
            "model": "gpt-4-1106-preview",
            "temperature": 0,
            "stream": false,
            "seed": 1
        },
        messages: messagesPayload
    };

    const intentOrResponseResult = await iqRestApiService.sendIqMessage(jwtToken || "", orgId, payload);
    if (intentOrResponseResult.error === undefined) {
        previousMessages.allChats = [...previousMessages.allChats, {
            role: "assistant",
            content: intentOrResponseResult.content
        }];
    }
    console.log(finalContent, intentOrResponseResult);

    return { intentAskQuestion: finalContent, intentOrResponseResult: intentOrResponseResult };
};


const getFinalResponse = async (message: string, additionalContext: IAdditionalContext, jwtToken: string, orgId: string, previousMessages: IIqStoredMessages) => {

    const basicPrompt = getFinalResponsePrompt;

    let additionalContextPrompt = "\n";
    for (const collectionIntentData of additionalContext.collectionIntent) {
        additionalContextPrompt += "the schema for collection " + collectionIntentData.collection + " is " + collectionIntentData.schemas + "\n";
        if (collectionIntentData.indexes && collectionIntentData.indexes.length > 0) {
            additionalContextPrompt += "the indexes for the collection are " + collectionIntentData.indexes + "\n";
        }
    }

    const codeSelected = getSelectedCode();
    const finalContent = basicPrompt + additionalContextPrompt + codeSelected + `Please focus now on answering the question and do not return JSON unless specified in the question. \n ${message}`;

    // system prompt for iQ
    const messagesPayload = [{
        role: "system",
        content: systemMessagePrompt
    },
    ...previousMessages.allChats.filter((msg) => msg.role !== "system" && msg.isIntent !== true), { // Remove all other system prompts
        role: "user",
        content: finalContent
    }];

    previousMessages.allChats = [...previousMessages.allChats, {
        role: "user",
        content: finalContent
    }];

    let payload = {
        completionSettings: {
            "model": "gpt-4-1106-preview",
            "temperature": 0,
            "stream": false,
            "seed": 1
        },
        messages: messagesPayload
    };

    const finalResult = await iqRestApiService.sendIqMessage(jwtToken || "", orgId, payload);
    if (finalResult.error === undefined) {
        previousMessages.allChats = [...previousMessages.allChats, {
            role: "assistant",
            content: finalResult.content
        }];
    }

    console.log(finalContent, finalResult);

    return { finalQuestion: finalContent, finalResult: finalResult };
};

export const iqChatHandler = async (context: vscode.ExtensionContext, iqPayload: any, cacheService: CacheService, allMessages: IIqStoredMessages[], webview: WebviewView): Promise<iqChatResult> => {
    const newMessage: string = iqPayload.newMessage, orgId: string = iqPayload.orgId, chatId: string = iqPayload.chatId, qaId: string = iqPayload.qaId;
    const userChats = iqPayload.userChats || [];
    const jwtToken = Memory.state.get<string>("vscode-couchbase.iq.jwtToken");
    if (jwtToken === undefined) {
        return {
            content: "",
            error: "failed to fetch jwtToken",
            status: "401"
        };
    }
    //const allMessages = Global.state.get<IStoredMessages[]>(`vscode-couchbase.iq.allMessages.${orgId}`) || [];
    let previousMessages: IIqStoredMessages | undefined;
    let messageIndex = -1;
    for (let i = 0; i < allMessages.length; i++) {
        if (allMessages[i].chatId === chatId) {
            previousMessages = allMessages[i];
            messageIndex = i;
            break;
        }
    }

    if (previousMessages === undefined) { // It's a new conversation, create a new chat id
        const allChats: iqChatType[] = [];
        previousMessages = {
            chatId: chatId,
            allChats: allChats,
            userChats: userChats,
            fullContextPerQaId: {}
        };
    }

    const config = vscode.workspace.getConfiguration('couchbase');
    const shareMessagesWithCouchbase = config.get<boolean>('iQ.sendMessagesToCouchbase') || false;

    const { intentAskQuestion, intentOrResponseResult } = await getIntentOrResponse(newMessage, jwtToken, orgId, cacheService, previousMessages);
    if (intentOrResponseResult.error !== undefined) { // Error while getting first response, returning
        previousMessages.fullContextPerQaId[qaId] =
        {
            originalQuestion: newMessage,
            intentAskQuestion: intentAskQuestion,
            intentReply: intentOrResponseResult.content,
            error: intentOrResponseResult.error,
            intent: {},
            additionalContext: undefined,
            finalQuestion: "",
            finalReply: intentOrResponseResult.content,
        };


        if (messageIndex !== -1) {
            allMessages[messageIndex] = previousMessages;
        } else {
            allMessages.push(previousMessages);
        }
        // Global.state.update(`vscode-couchbase.iq.allMessages.${orgId}`, allMessages);

        if (shareMessagesWithCouchbase) {
            const resultPayload: feedbackLambdaMessageType = {
                type: "error", // like/dislike/error
                question: newMessage,
                msgHistory: previousMessages.allChats,
                msgDate: (Date.now() / 1000).toFixed(0),
                origin: "vscode",
                additionalFeedback: "",
                chatId: chatId,
                qaId: qaId
            };

            iqRestApiService.sendMessageToLambda(context, resultPayload);
        }

        return intentOrResponseResult;
    }

    const jsonObjects = await jsonParser(intentOrResponseResult.content); // get parsed json

    if (jsonObjects.length === 0) {
        // NO JSON object received, return the value as answer;
        previousMessages.fullContextPerQaId[qaId] =
        {
            originalQuestion: newMessage,
            intentAskQuestion: intentAskQuestion,
            intentReply: intentOrResponseResult.content,
            intent: {},
            additionalContext: undefined,
            finalQuestion: "",
            finalReply: intentOrResponseResult.content,
        };

        previousMessages.userChats = [...previousMessages.userChats, {
            sender: "assistant",
            message: intentOrResponseResult.content,
            feedbackSent: false,
            msgDate: (Date.now() / 1000).toFixed(0),
            qaId: qaId
        }];

        if (messageIndex !== -1) {
            allMessages[messageIndex] = previousMessages;
        } else {
            allMessages.push(previousMessages);
        }

        if (shareMessagesWithCouchbase) {
            const resultPayload: feedbackLambdaMessageType = {
                type: "", // like/dislike/error
                question: newMessage,
                msgHistory: previousMessages.allChats,
                msgDate: (Date.now() / 1000).toFixed(0),
                origin: "vscode",
                additionalFeedback: "",
                chatId: chatId,
                qaId: qaId
            };

            iqRestApiService.sendMessageToLambda(context, resultPayload);
        }

        // Global.state.update(`vscode-couchbase.iq.allMessages.${orgId}`, allMessages);

        return intentOrResponseResult;
    }

    previousMessages.allChats[previousMessages.allChats.length - 1].isIntent = true; // Mark the isIntent Behavior of assistant message as json object was found

    const additionalContext: IAdditionalContext = { // add files and indexes if they will be passed as response
        collectionIntent: [],
    };

    await actionIntenthandler(jsonObjects[0], webview); // This function also sends back the actions for process to webview
    await collectionIntentHandler(jsonObjects[0], additionalContext, cacheService);

    const { finalQuestion, finalResult } = await getFinalResponse(newMessage, additionalContext, jwtToken, orgId, previousMessages);

    if (finalResult.error !== undefined) { // Error while getting response, returning
        previousMessages.fullContextPerQaId[qaId] =
        {
            originalQuestion: newMessage,
            intentAskQuestion: intentAskQuestion,
            intentReply: intentOrResponseResult.content,
            error: finalResult.error,
            intent: {},
            additionalContext: additionalContext,
            finalQuestion: finalQuestion,
            finalReply: finalResult.content,
        };


        if (messageIndex !== -1) {
            allMessages[messageIndex] = previousMessages;
        } else {
            allMessages.push(previousMessages);
        }
        // Global.state.update(`vscode-couchbase.iq.allMessages.${orgId}`, allMessages);
        if (shareMessagesWithCouchbase) {
            const resultPayload: feedbackLambdaMessageType = {
                type: "error", // like/dislike/error
                question: newMessage,
                msgHistory: previousMessages.allChats,
                msgDate: (Date.now() / 1000).toFixed(0),
                origin: "vscode",
                additionalFeedback: "",
                chatId: chatId,
                qaId: qaId
            };

            iqRestApiService.sendMessageToLambda(context, resultPayload);
        }

        return finalResult;
    }

    previousMessages.fullContextPerQaId[qaId] =
    {
        originalQuestion: newMessage,
        intentAskQuestion: intentAskQuestion,
        intentReply: intentOrResponseResult.content,
        intent: jsonObjects[0],
        additionalContext: additionalContext,
        finalQuestion: finalQuestion,
        finalReply: finalResult.content,
        error: finalResult.error
    };


    const newMsgDate = (Date.now() / 1000).toFixed(0);
    previousMessages.userChats = [...previousMessages.userChats, {
        sender: "assistant",
        message: finalResult.content,
        feedbackSent: false,
        msgDate: newMsgDate,
        qaId: qaId
    }];

    if (messageIndex !== -1) {
        allMessages[messageIndex] = previousMessages;
    } else {
        allMessages.push(previousMessages);
    }

    if (shareMessagesWithCouchbase) {
        const resultPayload: feedbackLambdaMessageType = {
            type: undefined, // like/dislike
            question: newMessage,
            msgHistory: previousMessages.allChats,
            msgDate: newMsgDate,
            origin: "vscode",
            additionalFeedback: "",
            chatId: chatId,
            qaId: qaId
        };

        iqRestApiService.sendMessageToLambda(context, resultPayload); // asynchronously send data to lambda
    }
    //Global.state.update(`vscode-couchbase.iq.allMessages.${orgId}`, allMessages);
    return finalResult;
};
