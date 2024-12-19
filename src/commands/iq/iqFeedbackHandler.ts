import { logger } from "../../logger/logger";
import { IIqStoredMessages, feedbackLambdaMessageType } from "./chat/types";
import { iqRestApiService } from "./iqRestApiService";
import * as vscode from 'vscode';

export const iqFeedbackHandler = async (context:vscode.ExtensionContext,messagePayload: any, allMessages: IIqStoredMessages[]) => {
    console.log("request to send feedback", messagePayload);
    const qaId = messagePayload.qaId;
    const chatId = messagePayload.chatId;

    // const allMessages = Global.state.get<IStoredMessages[]>(`vscode-couchbase.iq.allMessages.${orgId}`) || [];
    let previousMessages: IIqStoredMessages|undefined = undefined;
    let index = -1;
    for (let i=0;i<allMessages.length;i++) {
        if (allMessages[i].chatId === chatId) {
            previousMessages = allMessages[i];
            index = i;
            break;
        }
    }
    if (previousMessages === undefined) { 
        logger.error("failed to load messages in feedback handler, exited feedback handler");
        return;
    }

    previousMessages.userChats = messagePayload.userChats; // Update user chats as it now includes the thanks for feedback message
    allMessages[index] = previousMessages;
    //Global.state.update(`vscode-couchbase.iq.allMessages.${orgId}`, allMessages);

    const resultPayload:feedbackLambdaMessageType = {
        type: messagePayload.type, // like/dislike
        question: messagePayload.question,
        msgDate: messagePayload.msgDate,
        msgHistory: previousMessages.allChats,
        origin: "vscode",
        additionalFeedback: messagePayload.additionalFeedback,
        chatId: chatId,
        qaId: qaId
    };

    await iqRestApiService.sendMessageToLambda(context, resultPayload);
};