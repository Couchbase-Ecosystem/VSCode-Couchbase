import { iqRestApiService } from "./iqRestApiService";
import * as vscode from 'vscode';

export const iqFeedbackHandler = async (context:vscode.ExtensionContext,messagePayload: any) => {
    const resultPayload = {
        type: messagePayload.type, // like/dislike
        question: messagePayload.question,
        reply: messagePayload.reply
    };
    await iqRestApiService.sendMessageToLambda(context, resultPayload);
};