import { useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./IqChat.scss";
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/cjs/styles/prism";

const SyntaxHighlight = ({ language, value }) => {
    return (
        <SyntaxHighlighter
            style={nightOwl}
            language={language}
            children={value}
        />
    );
};

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
                    className="chatscope-chat-container"
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
                                className="chatscope-message"
                                key={index}
                                model={{
                                    payload: (
                                        <Message.CustomContent>
                                            <ReactMarkdown
                                                className="react-markdown"
                                                components={{
                                                    code({
                                                        node,
                                                        className,
                                                        children,
                                                        ...props
                                                    }) {
                                                        const match =
                                                            /language-(\w+)/.exec(
                                                                className || ""
                                                            );
                                                        return match ? (
                                                            <SyntaxHighlight
                                                                language={
                                                                    match[1]
                                                                }
                                                                value={String(
                                                                    children
                                                                ).replace(
                                                                    /\n$/,
                                                                    ""
                                                                )}
                                                                {...props}
                                                            />
                                                        ) : (
                                                            <code
                                                                style={{
                                                                    color: "red",
                                                                    backgroundColor:
                                                                        "black",
                                                                }}
                                                                className={
                                                                    className
                                                                }
                                                                {...props}
                                                            >
                                                                {children}
                                                            </code>
                                                        );
                                                    },
                                                }}
                                            >
                                                {message.message}
                                            </ReactMarkdown>
                                        </Message.CustomContent>
                                    ),
                                    direction:
                                        message.sender === "user"
                                            ? "outgoing"
                                            : "incoming",
                                    sender: message.sender,
                                    position: "normal",
                                }}
                            ></Message>
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
