import { useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./IqChat.scss";
import { MainContainer } from "./../../chatscope/src/components/MainContainer/MainContainer";
import { ChatContainer } from "../../chatscope/src/components/ChatContainer/ChatContainer";
import MessageList  from "../../chatscope/src/components/MessageList/MessageList";
import { Message } from "../../chatscope/src/components/Message/Message";
import { MessageInput } from "../../chatscope/src/components/MessageInput/MessageInput";
import { TypingIndicator } from "../../chatscope/src/components/TypingIndicator/TypingIndicator";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  nightOwl,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";
import { ActionBar, IActionBarButton } from "chatscope/src/components/ActionBar/ActionBar";

const IqChat = ({ org }) => {
  const [messages, setMessages] = useState<any[]>([
    {
      message: "Hello, I'm Couchbase IQ! Ask me anything!",
      sender: "assistant",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [codeTheme, setCodeTheme] = useState(oneLight);

  const [actions, setActions] = useState<IActionBarButton[]>([
    {
      onclick : () => {},
      name: "Cluster Overview"

    },
    {
      onclick : () => {},
      name: "Open Workbench"
    },
    {
      onclick : () => {},
      name: "Data Export"
    },
    {
      onclick : () => {},
      name: "Data Import"
    }
  ]);

  const handleMessageLike = (index) => {

    const originalReply = messages[index].message;
    const originalQuestion = index-1 > 0 ? messages[index-1].message : "";
    const newMessage = {
      message: "Glad you liked the result. Would you like to give more feedback",
      sender: "feedback",
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setActions([{
      onclick: ()=>{},
      name: "Send Feedback"
    }]);

    // send info to lambda
    tsvscode.postMessage({
      command: "vscode-couchbase.iq.sendFeedbackPerMessageEmote",
      value: {
        type: "like",
        question: originalQuestion,
        reply: originalReply
      }
    })
  };

  const handleMessageDislike = (index) => {
    const originalReply = messages[index].message;
    const originalQuestion = index-1 > 0 ? messages[index-1].message : "";
    const newMessage = {
      message: "Oh! We are very sorry. Can you please give us additional info via feedback",
      sender: "feedback",
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    // set actions to feedback
    setActions([{
      onclick: ()=>{},
      name: "Send Feedback"
    }]);

    tsvscode.postMessage({
      command: "vscode-couchbase.iq.sendFeedbackPerMessageEmote",
      value: {
        type: "dislike",
        question: originalQuestion,
        reply: originalReply
      }
    })
    // send info to lambda
  };

  const SyntaxHighlight = ({ language, value }) => {
    return (
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
    const text = event.clipboardData.getData("text");
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
        if(message.isDarkTheme){
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
      case "vscode-couchbase.iq.changeColorTheme": {
        if(message.theme === "Dark"){
          setCodeTheme(nightOwl);
        } else {
          setCodeTheme(oneLight);
        }
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
            className={`chatscope-message-list ${isTyping || actions.length > 0 ? "hasActionbar" : ""}`}
            scrollBehavior="smooth"
            actionbar={
              isTyping ? <TypingIndicator content="IQ is typing" /> : (actions.length > 0 ? <ActionBar buttons={actions}/>: undefined)
            }
          >
            {messages.map((message, index) => {
              if (message.sender !== "user") {
                const hasFooter = message.sender !== "user" && message.sender !== "feedback" && index!==0;
                return (
                  // If system/assistant is sending message, use markdown formatting
                  <Message
                    className={`chatscope-message ${hasFooter ? "hasFooter" : ""}`}
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
                    
                  >
                    { hasFooter ? 
                    <Message.Footer className="messageFooter">
                      <div className="likeButton" onClick={()=>handleMessageLike(index)}>
                      👍
                      </div>
                      <div className="dislikeButton" onClick={()=> handleMessageDislike(index)}>
                      👎
                      </div>
                      

                    </Message.Footer> :""
              }
                  </Message>
                );
              } else {
                // If user is sending message, use plain text rendering only
                return (
                  <Message className="chatscope-message" key={index}>
                    <Message.TextContent>{message.message}</Message.TextContent>
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
