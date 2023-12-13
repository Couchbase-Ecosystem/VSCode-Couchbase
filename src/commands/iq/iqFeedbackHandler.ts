import { iqRestApiService } from "./iqRestApiService";

export const iqFeedbackHandler = async (messagePayload: any) => {
    const resultPayload = {
        type: messagePayload.type, // like/dislike
        question: messagePayload.question,
        reply: messagePayload.reply
    };
    await iqRestApiService.sendMessageToLambda(resultPayload);
};