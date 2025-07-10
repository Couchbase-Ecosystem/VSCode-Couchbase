import { allMessagesType } from "./types";
import { AssistantRestAPI } from "../assistantRestAPI";
import { collectionIntentHandler } from "./collectionSchemaIntent";
import { CacheService } from "../../../util/cacheService/cacheService";
import * as vscode from "vscode";
import { availableCollections } from "./utils";
import { Global } from "../../../util/util";
import { Constants } from "../../../util/constants";
import crypto from 'crypto';

export const assistantChat = async (iqPayload: any, allMessages: allMessagesType[], cacheService: CacheService): Promise<any> => {
    const newMessage: string = iqPayload.newMessage, runId: string = iqPayload.runId, threadId: string = iqPayload.chatId;

    const userId = vscode.env.machineId;
    const hashedMachineId = crypto.createHash('sha256').update(userId).digest('hex');
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

    const content = newMessage;

    const messageBody = JSON.stringify({"data":{   
        content: content,
        threadId: threadId,
        runId: runId,
        role: "user",
        userId: hashedMachineId,
    }, "collection_names": availableCollectionNames});

    try {

        let response = await AssistantRestAPI.askAssistant(messageBody);
        // if(response && response.content && response.content.length > 0) {
        //     return response;
        // }

        // Check if response exists and has tool_args before entering the loop
        if (!response || !response.tool_args) {

            if(response && response.content && response.content.length > 0) {
                return response;
            }
            // Return a valid response object with an error message
            return {
                content: "",
                error: "Invalid response from assistant: No content or tool arguments provided"
            };
        }

        let cnt = 5;
        while (response.tool_args && cnt > 0) {
            // TODO: Handle human in the loop
            const toolArgs =response.tool_args;

            const collectionIntent = await collectionIntentHandler(toolArgs, cacheService);
            const collections = collectionIntent.map(item => JSON.stringify(item));

            const messageBody = JSON.stringify({
                "data": {
                    collections: collections,
                    threadId: threadId,
                    runId: runId,
                    userId: hashedMachineId,
                    role: "user",
                },
                
            });
            const restartAssistantResponse = await AssistantRestAPI.restartAssistant(messageBody);
        
            // Update response for next iteration
            response = restartAssistantResponse;

            // If there are no more tool_args, break the loop
            if (!response.tool_args) {
                if (restartAssistantResponse && restartAssistantResponse.content && restartAssistantResponse.content.length > 0) {
                    return restartAssistantResponse;
                }
                break;
            }

            cnt--;
            // If cnt reaches 0, break the loop to ensure it stops. Check if the response has content.
            if (cnt === 0) {
                if (restartAssistantResponse && restartAssistantResponse.content && restartAssistantResponse.content.length > 0) {
                    return restartAssistantResponse;
                }
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


export const ensureTermsAccepted = async(): Promise<boolean> => {
    const hasBeenShownWelcomeMessageAlready = !!Global.state.get(
        Constants.ASSISTANT_HAS_BEEN_SHOWN_WELCOME_MESSAGE
    );

    if (!hasBeenShownWelcomeMessageAlready) {
        const selection = await vscode.window.showInformationMessage(
            vscode.l10n.t('Welcome to Couchbase Participant! To use this feature, you must accept our terms and conditions.'),
            { modal: true },
            vscode.l10n.t('Accept & Continue'),
            vscode.l10n.t('View Terms'),
        );
        if (selection === vscode.l10n.t('Accept & Continue')) {
            await Global.state?.update(Constants.ASSISTANT_HAS_BEEN_SHOWN_WELCOME_MESSAGE, true);
            return true;
        }
        else if (selection === vscode.l10n.t('View Terms')) {
            vscode.env.openExternal(vscode.Uri.parse('https://www.couchbase.com/privacy-policy/'));
            vscode.env.openExternal(vscode.Uri.parse('https://www.couchbase.com/terms-of-use/'));

            return await ensureTermsAccepted();
        }
        else {
            return false;
        }
    }
    return true;


}