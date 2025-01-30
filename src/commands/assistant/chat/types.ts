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