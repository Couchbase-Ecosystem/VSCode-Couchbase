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
import {
  oneLight,
  nightOwl,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";

const IqChat = ({ org }) => {
  const [messages, setMessages] = useState<any[]>([
    {
      message: "Hello, I'm Couchbase IQ! Ask me anything!",
      sender: "assistant",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [codeTheme, setCodeTheme] = useState(oneLight);

  const SyntaxHighlight = ({ language, value }) => {
    return (
      // TODO: change on dark and light theme
      <SyntaxHighlighter
        style={codeTheme}
        language={language}
        children={value}
      />
    );
  };

  const handlePaste = (event) => {
    // Prevent the original paste action
    event.preventDefault();
    const text = (event.clipboardData).getData('text');
    const selection = window.getSelection();

    if (selection.rangeCount) {
      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(text));
    }

    const inputEvent = new Event("input", { bubbles: true });
    event.target.dispatchEvent(inputEvent);
  };

  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.command) {
      case "vscode-couchbase.iq.getMessageFromIQ": {
        const isDarkTheme = message.isDarkTheme;
        if (isDarkTheme) {
          setCodeTheme(nightOwl);
        } else {
          setCodeTheme(oneLight);
        }
        const newMessage = {
          message: message.content,
          sender: "assistant",
        };
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
      // Send message to CB IQ
      tsvscode.postMessage({
        command: "vscode-couchbase.iq.sendMessageToIQ",
        value: {
          newMessage: newMessage.message,
          orgId: org.data.id,
        },
      });
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  return (
    <div>
      <MainContainer className="chatscope-main-container" responsive>
        <ChatContainer
          className="chatscope-chat-container"
          style={{
            flex: 1,
            minHeight: "400px",
            height: "95vh",
          }}
        >
          <MessageList
            className="chatscope-message-list"
            scrollBehavior="smooth"
            typingIndicator={
              isTyping ? <TypingIndicator content="IQ is typing" /> : null
            }
          >
            {messages.map((message, index) => {
              if (message.sender !== "user") {
                return ( // If system/assistant is sending message, use markdown formatting
                  <Message
                    className="chatscope-message"
                    key={index}
                    model={{
                      payload: (
                        <Message.CustomContent>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            className="react-markdown"
                            components={{
                              code({ node, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(
                                  className || ""
                                );
                                return match ? (
                                  <SyntaxHighlight
                                    language={match[1]}
                                    value={String(children).replace(/\n$/, "")}
                                    {...props}
                                  />
                                ) : (
                                  <code className={className} {...props}>
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
                        message.sender === "user" ? "outgoing" : "incoming",
                      sender: message.sender,
                      position: "normal",
                    }}
                  ></Message>
                );
              } else { // If user is sending message, use plain text rendering only
                return (
                  <Message
                    className="chatscope-message"
                    key={index}
                  >
                    <Message.TextContent>
                    {message.message}
                    </Message.TextContent>
                  </Message>
                );
              }
            })}
          </MessageList>
          <MessageInput
            onPaste={(event) => {
              handlePaste(event);
            }}
            sendButton={true}
            attachButton={false}
            placeholder="Type a message..."
            onSend={(msg) => handleSendRequest(msg)}
            className="chatscope-message-input"
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default IqChat;
