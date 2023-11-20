import { useState, useEffect } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

const IqChat = ({ org }) => {
    const [messages, setMessages] = useState<any[]>([
        {
            message: "Hello, I'm Couchbase IQ! Ask me anything!",
            sender: "assistant",
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);

    window.addEventListener("message", (event) => {
        const message = event.data;
        switch (message.command) {
            case "vscode-couchbase.iq.getMessageFromIQ": {
                const newMessage = {
                    message: message.content,
                    sender: "assistant",
                };
                console.log(newMessage);
                const updatedMessages = [...messages, newMessage];
                setMessages(updatedMessages);

                setIsTyping(false);
                break;
            }
        }
    });

    const handleSendRequest = async (message: string) => {
        const newMessage = {
            message,
            sender: "user",
        };

        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setIsTyping(true);

        try {
            const apiMessages = updatedMessages.map((messageObject) => {
                return {
                    role: messageObject.sender,
                    content: messageObject.message,
                };
            });

            const iqPayload = {
                model: "gpt-4",
                messages: [
                    { role: "system", content: "I'm a Student" },
                    ...apiMessages,
                ],
            };
            // Send message to CB IQ
            tsvscode.postMessage({
                command: "vscode-couchbase.iq.sendMessageToIQ",
                value: JSON.stringify(iqPayload),
            });
        } catch (error) {
            console.error("Error processing message:", error);
        }
    };

    return (
        <div>
            <MainContainer responsive>
                <ChatContainer
                    style={{
                        flex: 1,
                        minHeight: "400px",
                        height: "95vh",
                    }}
                >
                    <MessageList
                        scrollBehavior="smooth"
                        typingIndicator={
                            isTyping ? (
                                <TypingIndicator content="IQ is typing" />
                            ) : null
                        }
                    >
                        {messages.map((message, index) => (
                            <Message
                                key={index}
                                model={{
                                    message: message.message,
                                    direction:
                                        message.sender === "user"
                                            ? "outgoing"
                                            : "incoming",
                                    sender: message.sender,
                                    position: "normal",
                                }}
                            />
                        ))}
                    </MessageList>
                    <MessageInput
                        sendButton={true}
                        attachButton={false}
                        placeholder="Type a message..."
                        onSend={(msg) => handleSendRequest(msg)}
                    />
                </ChatContainer>
            </MainContainer>
        </div>
    );
};

export default IqChat;
