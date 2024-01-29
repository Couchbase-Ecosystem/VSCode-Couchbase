export type iqChatType = {
    content: string;
    role: string;
    isIntent?: boolean;
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

export type fullContextPerQaIdType = { [qaId: string]: fullContextType };

export interface IIqStoredMessages {
    allChats: iqChatType[];
    userChats: userChatType[];
    fullContextPerQaId: fullContextPerQaIdType;
    chatId: string;
}

export type collectionIntentType = {
    collection: string,
    schemas: string,
    indexes?: string
};

export interface IAdditionalContext {
    collectionIntent: collectionIntentType[],
}

export type feedbackLambdaMessageType = {
    type: string | undefined, // Like/ Dislike/ Error/ No option selected
    question: string, // original question asked by user
    msgHistory: any, // Previous Messages History
    msgDate: string, // Time and Date upto seconds
    origin: string, // Specifiying origin of feedback, vscode or jetbrains
    additionalFeedback: string, // When user specifically uses send feedback button to send more info
    chatId: string,
    qaId: string
};

export type iqChatResult = {
    content: string,
    error: any,
    status: string
};