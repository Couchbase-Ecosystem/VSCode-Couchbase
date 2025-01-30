import { allMessagesType } from "./types";
import { AssistantRestAPI } from "../assistantRestAPI";

export const assistantChat = async (iqPayload: any, allMessages: allMessagesType[]): Promise<any> => {
    const newMessage: string = iqPayload.newMessage, sessionId: string = iqPayload.sessionId, threadId: string = iqPayload.threadId;

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

    const messageBody = JSON.stringify({   
        message: newMessage,
        threadId: threadId,
        sessionId: sessionId,
    });

    try {
        const response = await AssistantRestAPI.askAssistant(messageBody);
        return response;
    } catch (error) {
        return {
            content: "",
            error: error,
        };
    }
};