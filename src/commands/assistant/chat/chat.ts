import { allMessagesType, collectionIntentType } from "./types";
import { AssistantRestAPI } from "../assistantRestAPI";
import { collectionIntentHandler } from "./collectionSchemaIntent";
import { CacheService } from "../../../util/cacheService/cacheService";
import * as vscode from "vscode";

export const assistantChat = async (iqPayload: any, allMessages: allMessagesType[], cacheService: CacheService): Promise<any> => {
    const newMessage: string = iqPayload.newMessage, sessionId: string = iqPayload.sessionId, threadId: string = iqPayload.threadId;

    const userId = vscode.env.machineId;

    let previousMessages: allMessagesType | undefined;

    const messageIndex = allMessages.findIndex(message => message.sessionId === sessionId);
    if (messageIndex !== -1) {
        previousMessages = allMessages[messageIndex];
    }

    if (previousMessages === undefined) { // It's a new conversation, start a new session
        previousMessages = {
            sessionId: sessionId,
            chats: [],
        };
    }

    const messageBody = JSON.stringify({"data":{   
        content: newMessage,
        threadId: threadId,
        sessionId: sessionId,
        role: "user",
        userId: userId,
    }});

    try {
        let response = await AssistantRestAPI.askAssistant(messageBody);
        if(response.content.length > 0) {
            return response;
        }

        let cnt = 5;
        while(response.tool_args && cnt > 0){
            // TODO: Handle human in the loop
            const toolArgs = JSON.parse(response.tool_args);
            console.log("inside tool args chat",toolArgs);
            //const cacheService = new CacheService();
            
            const collectionIntent = await collectionIntentHandler(toolArgs, cacheService);

            console.log("Got collection intent", collectionIntent);
            
            const restartAssistantResponse = await AssistantRestAPI.restartAssistant(JSON.stringify({"data":{
                collections: collectionIntent,
                threadId: threadId,
                sessionId: sessionId,
                userId: userId,
                role: "user",
            }}));

            console.log(restartAssistantResponse);
            
            response = restartAssistantResponse;
            cnt--;
        }

        if(response.content.length > 0) {
            return response;
        }
        else {
            response.error = "Invalid response from assistant";
            return response;
        }
    } catch (error) {
        return {
            content: "",
            error: error,
        };
    }
};