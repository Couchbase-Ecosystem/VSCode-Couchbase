export type assistantThreadType = {
    threadId: string,
    question: string,
    answer: string,
};

export type assistantChatType = {
    threadChat: Array<assistantThreadType>,
};

export type allMessagesType = {
    sessionId: string,
    chats: assistantChatType[],
};

export type AssistantResponse = {
    content: string;
    error?: string;
    status: string;
    thread_id: string;
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