import { logger } from "../../logger/logger";
import { IStoredMessages } from "./chat/iqChatHandler";
import { feedbackLambdaMessageType } from "./chat/types";
import { iqRestApiService } from "./iqRestApiService";
import * as vscode from 'vscode';

export const iqFeedbackHandler = async (context:vscode.ExtensionContext,messagePayload: any, allMessages: IStoredMessages[]) => {
    console.log("request to send feedback", messagePayload);
    const qaId = messagePayload.qaId;
    const chatId = messagePayload.chatId;
    const orgId = messagePayload.orgId;

    // const allMessages = Global.state.get<IStoredMessages[]>(`vscode-couchbase.iq.allMessages.${orgId}`) || [];
    let previousMessages: IStoredMessages|undefined = undefined;
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

    let intent = {};
    let finalQuestion = "";
    let firstQuestion = "";

    console.log(previousMessages.fullContextPerQaId);
    const fullContextPerQaId: any = new Map(Object.entries(previousMessages.fullContextPerQaId)); // Convert to map for easy use

    const fullContext = fullContextPerQaId.get(qaId);
    console.log(fullContext);
    if(fullContext !== undefined) {
        intent = fullContext.intent;
        finalQuestion = fullContext.finalQuestion;
        firstQuestion = fullContext.intentAskQuestion;
    }

    const resultPayload:feedbackLambdaMessageType = {
        type: messagePayload.type, // like/dislike
        question: messagePayload.question,
        reply: messagePayload.reply,
        msgDate: messagePayload.msgDate,
        origin: "vscode",
        additionalFeedback: messagePayload.additionalFeedback,
        intent: intent,
        finalQuestion: finalQuestion,
        firstQuestion: firstQuestion
    };
    console.log("resultPayload ",resultPayload);

    await iqRestApiService.sendMessageToLambda(context, resultPayload);
};