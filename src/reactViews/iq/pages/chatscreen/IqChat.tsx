import { useEffect, useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./IqChat.scss";
import { MainContainer } from "./../../chatscope/src/components/MainContainer/MainContainer";
import { ChatContainer } from "../../chatscope/src/components/ChatContainer/ChatContainer";
import MessageList from "../../chatscope/src/components/MessageList/MessageList";
import { Message } from "../../chatscope/src/components/Message/Message";
import { MessageInput } from "../../chatscope/src/components/MessageInput/MessageInput";
import { TypingIndicator } from "../../chatscope/src/components/TypingIndicator/TypingIndicator";
import { v4 as uuid } from "uuid";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  nightOwl,
} from "react-syntax-highlighter/dist/cjs/styles/prism";

import {
  ActionBar,
  IActionBarButton,
} from "chatscope/src/components/ActionBar/ActionBar";
import { ChatAction, availableActions } from "utils/ChatAction";
import { SendFeedback } from "components/chatActions/SendFeedback";
import ThumbsUp from "../../assets/icons/ThumbsUp";
import ThumbsDown from "../../assets/icons/ThumbsDown";
import { ModalWithCancelButton } from "components/modals/ModalWithCancelButton";
import { ConversationHeader } from "../../chatscope/src/components/ConversationHeader/ConversationHeader";
import { parseErrorMessages } from "utils/ErrorMessages";
import { CopyButton } from "assets/icons/CopyButton";
import { applyCodeQuery, handleCodeCopy } from "utils/utils";
import { SendToWorkbench } from "assets/icons/SendToWorkbench";
import { Tooltip } from "react-tooltip";

export type userMessage = {
  message: string;
  sender: string;
  qaId: string;
  feedbackSent: boolean;
  msgDate?: string;
};

export type iqMessages = {
  userChats: userMessage[];
  chatId: string;
};

const IqChat = ({ org, setIsLoading }) => {
  const [messages, setMessages] = useState<iqMessages>({
    userChats: [
      {
        message:
          "Greetings, I am Capella iQ! Feel free to inquire about anything related to Couchbase.",
        sender: "assistant",
        msgDate: (Date.now() / 1000).toFixed(0),
        qaId: "firstMessage",
        feedbackSent: false,
      },
    ],
    chatId: uuid(),
  });
  const [isTyping, setIsTyping] = useState(false);
  const [codeTheme, setCodeTheme] = useState(oneLight);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isChatCompleted, setIsChatCompleted] = useState(false);
  const [feedbackModalData, setFeedbackModalData] = useState({
    msgIndex: -1,
    qaId: "",
  });
  const [actions, setActions] = useState<IActionBarButton[]>([]);
  const [runningConversation, setRunningConversation] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsLoading(false);
    tsvscode.postMessage({
      command: "vscode-couchbase.iq.showLogoutButton",
      value: {
        enabled: true,
      },
    });

    tsvscode.postMessage({
      command: "vscode-couchbase.iq.showNewChatButton",
      value: {
        enabled: true,
      },
    });
  }, []);

  const handleMessageLike = (index: number, qaId: string) => {
    const originalReply = messages.userChats[index].message;
    const originalQuestion =
      index - 1 > 0 ? messages.userChats[index - 1].message : "";
    const newMessage: userMessage = {
      message:
        "Glad you liked the result. Would you like to give more feedback",
      sender: "feedback",
      msgDate: (Date.now() / 1000).toFixed(0),
      qaId: qaId,
      feedbackSent: false,
    };

    const messagesCopy = [...messages.userChats];
    messagesCopy[index].feedbackSent = true;

    const updatedMessages = [...messagesCopy, newMessage];
    setMessages({
      chatId: messages.chatId,
      userChats: updatedMessages,
    });

    setActions([
      ChatAction(
        "Send Feedback",
        setShowFeedbackModal,
        setFeedbackModalData,
        index,
        qaId
      ),
    ]);
    // send info to lambda
    tsvscode.postMessage({
      command: "vscode-couchbase.iq.sendFeedbackPerMessageEmote",
      value: {
        type: "like",
        question: originalQuestion,
        reply: originalReply,
        msgDate: newMessage.msgDate,
        additionalFeedback: "",
        qaId: qaId,
        chatId: messages.chatId,
        orgId: org.data.id,
        userChats: updatedMessages,
      },
    });
  };

  const handleMessageDislike = (index: number, qaId: string) => {
    const originalReply = messages.userChats[index].message;
    const originalQuestion =
      index - 1 > 0 ? messages.userChats[index - 1].message : "";
    const newMessage: userMessage = {
      message:
        "Oh! We are very sorry. Can you please give us additional info via feedback",
      sender: "feedback",
      msgDate: (Date.now() / 1000).toFixed(0),
      qaId: qaId,
      feedbackSent: false,
    };

    const messagesCopy = [...messages.userChats];
    messagesCopy[index].feedbackSent = true;

    const updatedMessages = [...messagesCopy, newMessage];
    setMessages({
      chatId: messages.chatId,
      userChats: updatedMessages,
    });

    // set actions to feedback
    setActions([
      ChatAction(
        "Send Feedback",
        setShowFeedbackModal,
        setFeedbackModalData,
        index,
        qaId
      ),
    ]);

    tsvscode.postMessage({
      command: "vscode-couchbase.iq.sendFeedbackPerMessageEmote",
      value: {
        type: "dislike",
        question: originalQuestion,
        reply: originalReply,
        msgDate: newMessage.msgDate,
        additionalFeedback: "",
        qaId: qaId,
        chatId: messages.chatId,
        userChats: updatedMessages,
      },
    });
    // send info to lambda
  };

  const handleFeedbackSubmit = (feedbackText) => {
    if (feedbackText.trim() === "") {
      return;
    }
    const index = feedbackModalData.msgIndex;
    const qaId = feedbackModalData.qaId;
    const originalReply = messages.userChats[index].message;
    const originalQuestion =
      index - 1 > 0 ? messages.userChats[index - 1].message : "";

    tsvscode.postMessage({
      command: "vscode-couchbase.iq.sendFeedbackPerMessageEmote",
      value: {
        type: null,
        question: originalQuestion,
        reply: originalReply,
        msgDate: (Date.now() / 1000).toFixed(0),
        additionalFeedback: feedbackText,
        qaId: qaId,
        chatId: messages.chatId,
      },
    });
  };

  const SyntaxHighlight = ({ language, value }) => {
    if (language === "sql") {
      language = "n1ql";
    }
    return (
      <div className="multiline-code-container">
        <div className="multiline-code-header">
          <div className="code-language-info">
            {language === "n1ql" ? "SQL++" : language.toUpperCase()}
          </div>
          <div className="code-actions">
            <Tooltip id="my-tooltip" />
            {language === "n1ql" && (
              <>
                <button
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Send query to workbench"
                  data-tooltip-place="top"
                  className="applyQueryButton iconButton"
                  onClick={() => applyCodeQuery(value)}
                  onLoad={() => console.log("updated")}
                >
                  <SendToWorkbench />
                </button>
              </>
            )}
            <button
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Copy code to clipboard"
              data-tooltip-place="top"
              className="copyButton iconButton"
              onClick={() => handleCodeCopy(value)}
            >
              <CopyButton />
            </button>
          </div>
        </div>
        <SyntaxHighlighter
          className="multiline-code"
          style={codeTheme}
          language={language}
          children={value}
        />
      </div>
    );
  };

  const handlePaste = (event) => {
    // Prevent the original paste action
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    const selection = window.getSelection();

    if (selection.rangeCount) {
      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(text));
    }

    const inputEvent = new Event("input", { bubbles: true });
    event.target.dispatchEvent(inputEvent);
  };

  const openNewChat = () => {
    setMessages({
      userChats: [
        {
          message:
            "Greetings, I am Capella iQ! Feel free to inquire about anything related to Couchbase.",
          sender: "assistant",
          msgDate: (Date.now() / 1000).toFixed(0),
          qaId: "firstMessage",
          feedbackSent: false,
        },
      ],
      chatId: uuid(),
    });
    setIsTyping(false);
    setIsChatCompleted(false);
    setShowFeedbackModal(false);
    setShowNewChatModal(false);
    setActions([]);
  };

  const onNewChatClick = () => {
    setShowFeedbackModal(false);
    setShowNewChatModal(true);
  };

  const onChatCompleted = (error) => {
    setIsTyping(false);
    setShowFeedbackModal(false);
    setShowNewChatModal(false);
    setActions([]);
    setIsChatCompleted(true);
    if(typeof(error) === "string"){
      setErrorMessage(error);
    } else {
      const formattedError = parseErrorMessages(JSON.parse(error));
      setErrorMessage(formattedError);
    }
    
  };

  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.command) {
      case "vscode-couchbase.iq.getMessageFromIQ": {
        if (message.isDarkTheme) {
          setCodeTheme(nightOwl);
        } else {
          setCodeTheme(oneLight);
        }

        const newMessage: userMessage = {
          message: message.content,
          sender: "assistant",
          feedbackSent: false,
          msgDate: message.msgDate,
          qaId: message.qaId,
        };
        setRunningConversation(undefined);
        const updatedMessages = [...messages.userChats, newMessage];

        setMessages({
          chatId: messages.chatId,
          userChats: updatedMessages,
        });

        setIsTyping(false);
        break;
      }
      case "vscode-couchbase.iq.changeColorTheme": {
        if (message.theme === "Dark") {
          setCodeTheme(nightOwl);
        } else {
          setCodeTheme(oneLight);
        }
        break;
      }
      case "vscode-webview.iq.updateActions": {
        const actionsForBar = [];
        for (const action of message.actions) {
          if (availableActions.includes(action)) {
            if (action === "Send Feedback") {
              actionsForBar.push(
                ChatAction(
                  action,
                  setShowFeedbackModal,
                  setFeedbackModalData,
                  0,
                  "firstMessage"
                )
              ); // TODO: Right now Gives feedback to just the first message
            } else {
              actionsForBar.push(ChatAction(action));
            }
          }
        }
        setActions(actionsForBar);
        break;
      }
      case "vscode-couchbase.iq.sendNewChatRequest": {
        onNewChatClick();
        break;
      }
      case "vscode-couchbase.iq.chatCompleted": {
        // The chat has ran into some errors and can no longer be continued.
        onChatCompleted(message.error);
        break;
      }
    }
  });

  const handleSendRequest = async (message: string) => {
    if (isTyping) {
      // Don't accept new message if currently it's typing
      return;
    }
    const newMessage: userMessage = {
      message,
      sender: "user",
      msgDate: (Date.now() / 1000).toFixed(0),
      qaId: uuid(),
      feedbackSent: false,
    };

    const updatedMessages = [...messages.userChats, newMessage];
    setMessages({
      chatId: messages.chatId,
      userChats: updatedMessages,
    });
    setIsTyping(true);
    try {
      // Send message to CB iQ
      tsvscode.postMessage({
        command: "vscode-couchbase.iq.sendMessageToIQ",
        value: {
          newMessage: newMessage.message,
          orgId: org.data.id,
          userChats: updatedMessages,
          chatId: messages.chatId,
          qaId: newMessage.qaId,
        },
      });

      setRunningConversation(newMessage.qaId);

      setTimeout(()=>{
        if(runningConversation === newMessage.qaId){
          onChatCompleted("The chat has timed out. Please ask again with a new conversation");
        }
      }, 60000);
      
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  return (
    <div>
      <MainContainer className="chatscope-main-container" responsive>
        <ChatContainer className="chatscope-chat-container">
          <MessageList
            className={`chatscope-message-list ${
              isTyping || actions.length > 0 ? "hasActionbar" : ""
            }`}
            scrollBehavior="auto"
            autoScrollToBottom={true}
            autoScrollToBottomOnMount={true}
            actionbar={
              isTyping ? (
                <TypingIndicator
                  content="iQ is typing"
                  className="typingIndicator"
                />
              ) : actions.length > 0 ? (
                <ActionBar buttons={actions} />
              ) : undefined
            }
          >
            {messages.userChats.map((message, index) => {
              if (message.sender !== "user") {
                const hasFooter =
                  message.sender !== "user" &&
                  message.sender !== "feedback" &&
                  index !== 0;
                return (
                  // If system/assistant is sending message, use markdown formatting
                  <Message
                    className={`chatscope-message ${
                      hasFooter ? "hasFooter" : ""
                    }`}
                    key={index}
                    model={{
                      payload: (
                        <Message.CustomContent>
                          <ReactMarkdown
                            className="react-markdown"
                            components={{
                              code({ node, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(
                                  className || ""
                                );
                                const code = String(children).replace(
                                  /\n$/,
                                  ""
                                );
                                const isMultiline = code.includes("\n");
                                const language = match
                                  ? match[1]
                                  : isMultiline
                                  ? "n1ql"
                                  : "plaintextCode";
                                return language === "plaintextCode" ? (
                                  <code
                                    className={className + " single-line-code"}
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                ) : (
                                  <SyntaxHighlight
                                    language={language}
                                    value={String(children).replace(/\n$/, "")}
                                    {...props}
                                  />
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
                    {hasFooter ? (
                      <Message.Footer className="messageFooter">
                        {message.feedbackSent !== true ? (
                          <>
                            <button
                              className="likeButton iconButton"
                              onClick={() =>
                                handleMessageLike(index, message.qaId)
                              }
                            >
                              <ThumbsUp />
                            </button>
                            <button
                              className="dislikeButton iconButton"
                              onClick={() =>
                                handleMessageDislike(index, message.qaId)
                              }
                            >
                              <ThumbsDown />
                            </button>
                          </>
                        ) : (
                          <div className="feedbackSentFooter">
                            Thanks for voting!
                          </div>
                        )}
                      </Message.Footer>
                    ) : (
                      ""
                    )}
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
          {!isChatCompleted ? (
            <MessageInput
              onPaste={(event) => {
                handlePaste(event);
              }}
              attachButton={false}
              sendButton={true}
              placeholder="Type a message..."
              onSend={(msg) => handleSendRequest(msg)}
              className="chatscope-message-input"
            />
          ) : (
            <ConversationHeader>
              <ConversationHeader.Content>
                <div className="chat-over-container">
                  <div className="chat-over-error-message">{errorMessage}</div>
                  <div className="chat-over-message">
                    This chat session is no longer active. To continue the
                    conversation, please initiate a new chat.
                  </div>
                  <button
                    className="chat-over-newchat-button"
                    onClick={() => onNewChatClick()}
                  >
                    Start a new Chat
                  </button>
                </div>
              </ConversationHeader.Content>
            </ConversationHeader>
          )}
        </ChatContainer>

        {/* Modals Area, Please put all the modals here and control them using states */}
        <SendFeedback
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={(text) => handleFeedbackSubmit(text)}
        />

        <ModalWithCancelButton
          isOpen={showNewChatModal}
          onClose={() => setShowNewChatModal(false)}
          onSubmit={() => openNewChat()}
          content={
            "Starting new chat will result in loss of data of previous conversation, is it okay to proceed?"
          }
        />
      </MainContainer>
    </div>
  );
};

export default IqChat;
