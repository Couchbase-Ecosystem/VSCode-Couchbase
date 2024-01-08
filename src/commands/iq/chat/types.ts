export type iqChatType = {
    content: string;
    role: string;
};

export type userChatType = {
    message: string;
    sender: string;
    qaId: string;
    feedbackSent?: boolean;
    msgDate?: string;
};

export type fullContextType = {
    originalQuestion: string;
    intentAskQuestion: string;
    intentReply: string;
    intent: object;
    error?: string;
    additionalContext: IAdditionalContext | undefined;
    finalQuestion: string;
    finalReply: string;
    feedbackType?: string;
    feedbackMsg?: string;
};

export type fullContextPerQaIdType = Map<string, fullContextType>;

export interface IStoredMessages {
    allChats: iqChatType[];
    userChats: userChatType[];
    fullContextPerQaId: fullContextPerQaIdType;
    chatId: string;
}

export type collectionIntentType = {
    collection: string,
    schemas: string,
    indexes?: string
}

export interface IAdditionalContext {
    collectionIntent: collectionIntentType[],
}

export type feedbackLambdaMessageType = {
    type: string | undefined, // Like/ Dislike/ No option selected
    question: string, // original question asked by user
    reply: string, // final reply to user
    intent: object, // JSON Object received from IQ to understand intent
    finalQuestion: string, // Final Question asked by system based on intent
    firstQuestion: string, // First Question asked by system to understand intent
    msgDate: number, // Time and Date upto seconds
    origin: string, // Specifiying origin of feedback, vscode or jetbrains
    additionalFeedback: string, // When user specifically uses send feedback button to send more info
};