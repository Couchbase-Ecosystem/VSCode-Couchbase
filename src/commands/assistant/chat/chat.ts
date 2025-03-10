import { allMessagesType, collectionIntentType } from "./types";
import { AssistantRestAPI } from "../assistantRestAPI";
import { collectionIntentHandler } from "./collectionSchemaIntent";
import { CacheService } from "../../../util/cacheService/cacheService";
import * as vscode from "vscode";
import { logger } from "../../../logger/logger";
import { availableCollections } from "./utils";

export const assistantChat = async (iqPayload: any, allMessages: allMessagesType[], cacheService: CacheService): Promise<any> => {
    const newMessage: string = iqPayload.newMessage, runId: string = iqPayload.runId, threadId: string = iqPayload.chatId;

    const userId = vscode.env.machineId;

    let previousMessages: allMessagesType | undefined;

    const messageIndex = allMessages.findIndex(message => message.threadId === threadId);
    if (messageIndex !== -1) {
        previousMessages = allMessages[messageIndex];
    }

    if (previousMessages === undefined) { // It's a new conversation, start a new session
        previousMessages = {
            threadId: threadId,
            chats: [],
        };
    }

    const availableCollectionNames = await availableCollections(cacheService);

    const content = "This is the beginning of a new message from Human. Within 5 iterations, you must reply back to the human with a valid response. Don't drag the conversation with excessive tool calls. \n ----------------- \n " + newMessage;

    const messageBody = JSON.stringify({"data":{   
        content: content,
        threadId: threadId,
        runId: runId,
        role: "user",
        userId: userId,
    }, "collection_names": availableCollectionNames});

    try {

        let response = await AssistantRestAPI.askAssistant(messageBody);
        if(response && response.content && response.content.length > 0) {
            return response;
        }

        // Check if response exists and has tool_args before entering the loop
        if (!response || !response.tool_args) {
            // Return a valid response object with an error message
            return {
                content: "",
                error: "Invalid response from assistant: No content or tool arguments provided"
            };
        }

        let cnt = 5;
        while (response.tool_args && cnt > 0) {
            // TODO: Handle human in the loop
            const toolArgs = JSON.parse(response.tool_args);

            const collectionIntent = await collectionIntentHandler(toolArgs, cacheService);

            const messageBody = JSON.stringify({
                "data": {
                    collections: collectionIntent,
                    threadId: threadId,
                    runId: runId,
                    userId: userId,
                    role: "user",
                }
            });
            const restartAssistantResponse = await AssistantRestAPI.restartAssistant(messageBody);
        
            // Check if the response has content
            if (restartAssistantResponse && restartAssistantResponse.content && restartAssistantResponse.content.length > 0) {
                return restartAssistantResponse;
            }

            // Update response for next iteration
            response = restartAssistantResponse;

            // If there are no more tool_args, break the loop
            if (!response.tool_args) {
                break;
            }

            cnt--;
            // If cnt reaches 0, break the loop to ensure it stops
            if (cnt === 0) {
                console.log("Loop stopped due to cnt reaching 0");
                break;
            }
        }

        response.error = "Invalid response from assistant";
        return response;
        
    } catch (error) {
        return {
            content: "",
            error: error,
        };
    }
};