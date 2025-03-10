export type assistantRunType = {
    runId: string,
    question: string,
    answer: string,
};

export type assistantChatType = {
    runChat: Array<assistantRunType>,
};

export type allMessagesType = {
    threadId: string,
    chats: assistantChatType[],
};

export type AssistantResponse = {
    content: string;
    error?: string;
    status: string;
    threadId: string;
    runId: string;
    tool_args: string | null;
};

export type collectionIntentType = {
    collection: string,
    schemas: string,
    indexes?: string
};

export interface IAdditionalContext {
    collectionIntent: collectionIntentType[],
}