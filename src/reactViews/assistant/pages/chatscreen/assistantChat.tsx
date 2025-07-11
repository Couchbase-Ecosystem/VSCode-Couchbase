import { useEffect, useState, useRef } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./IqChat.scss";
import { MainContainer } from "../../chatscope/src/components/MainContainer/MainContainer";
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
} from "../../chatscope/src/components/ActionBar/ActionBar";
import { ChatAction, availableActions } from "../../utils/ChatAction";
import { ModalWithCancelButton } from "../../components/modals/ModalWithCancelButton";
import { ConversationHeader } from "../../chatscope/src/components/ConversationHeader/ConversationHeader";
import { parseErrorMessages } from "../../utils/ErrorMessages";
import { CopyButton } from "../../assets/icons/CopyButton";
import { applyCodeQuery, handleCodeCopy } from "../../utils/utils";
import { SendToWorkbench } from "../../assets/icons/SendToWorkbench";
import { Tooltip } from "react-tooltip";
import ThumbsUp from "../../assets/icons/ThumbsUp";
import ThumbsDown from "../../assets/icons/ThumbsDown";
import { SendFeedback } from "../../components/chatActions/SendFeedback";

interface MessageListHandle {
  scrollToBottom: (scrollBehavior?: string) => void;
}

export type userMessage = {
  message: string;
  sender: string;
  runId: string;
  feedbackSent: boolean;
  msgDate?: string;
};

export type iqMessages = {
  userChats: userMessage[];
  chatId: string;
};

const AssistantChat = ({ setIsLoading }) => {
  const [messages, setMessages] = useState<iqMessages>({
    userChats: [
      {
        message:
          "Greetings, I am Couchbase Assistant! Feel free to inquire about anything related to Couchbase.",
        sender: "assistant",
        msgDate: (Date.now() / 1000).toFixed(0),
        feedbackSent: false,
        runId: "firstMessage",
      },
    ],
    chatId: uuid(),
  });
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [codeTheme, setCodeTheme] = useState(oneLight);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isChatCompleted, setIsChatCompleted] = useState(false);
  const [feedbackModalData, setFeedbackModalData] = useState({
    msgIndex: -1,
    runId: "firstMessage",
    isUpvote: null as boolean | null
  });
  const [actions, setActions] = useState<IActionBarButton[]>([]);
  const [runningConversation, setRunningConversation] = useState<
    string | undefined
  >(undefined);
  const messageListRef = useRef<MessageListHandle | null>(null);
  console.log(showFeedbackModal, feedbackModalData);

  useEffect(() => {
      const msgListInstance = messageListRef.current;
      if (
          msgListInstance &&
          typeof msgListInstance.scrollToBottom === "function"
      ) {
          msgListInstance.scrollToBottom();
      }
  }, [messages.userChats]);

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

  const openNewChat = () => {
    setMessages({
      userChats: [
        {
          message:
            "Greetings, I am Couchbase Assistant! Feel free to inquire about anything related to Couchbase.",
          sender: "assistant",
          msgDate: (Date.now() / 1000).toFixed(0),
          runId: "firstMessage",
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
    try {
      const formattedError = parseErrorMessages(error);
      console.log("formattedError", formattedError);
      setErrorMessage(formattedError);
    } catch (error){
      // Adding if error is not JSON type or it failed to parse
      setErrorMessage(error.message);
    }
  };

  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.command) {
      case "vscode-couchbase.assistant.reply": {
        if (message.isDarkTheme) {
          setCodeTheme(nightOwl);
        } else {
          setCodeTheme(oneLight);
        }

        const newMessage: userMessage = {
          message: message.message,
          sender: "assistant",
          feedbackSent: false,
          msgDate: message.msgDate,
          runId: message.runId,
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
              ); // Gives feedback to the first message
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
      case "vscode-couchbase.assistant.chatCompleted": {
        // The chat has ran into some errors and can no longer be continued.
        console.log("Chat Completed: " + message.error);
        setTimeout(() => {
          onChatCompleted(message.error);
        }, 3000);
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
      runId: uuid(),
      feedbackSent: false,
    };
    const updatedMessages = [...messages.userChats, newMessage];
    setMessages({
      chatId: messages.chatId,
      userChats: updatedMessages,
    });
    setIsTyping(true);
    try {
      const runId = "vscode_assistant_run_" + uuid();
      // Send message to CB iQ
      tsvscode.postMessage({
        command: "vscode-couchbase.assistant.askAssistant",
        value: {
          newMessage: newMessage.message,
          userChats: updatedMessages,
          chatId: messages.chatId,
          runId: runId,
        },
      });

      setRunningConversation(runId);

      setTimeout(() => {
        if (runningConversation === runId) {
          onChatCompleted(
            "The chat has timed out. Please ask again with a new conversation"
          );
        }
      }, 60000);
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  const handleMessageLike = (index: number, runId: string) => {
    
    
    const newMessage: userMessage = {
      message:
        "Glad you liked the result. Would you like to give more feedback?",
      sender: "feedback",
      msgDate: (Date.now() / 1000).toFixed(0),
      runId: runId,
      feedbackSent: false,
    };

    const messagesCopy = [...messages.userChats];
    messagesCopy[index].feedbackSent = true;

    const updatedMessages = [...messagesCopy, newMessage];
    setMessages({
      chatId: messages.chatId,
      userChats: updatedMessages,
    });

    // Add Send Feedback button to the action bar
    setActions([
      ChatAction(
        "Send Feedback",
        setShowFeedbackModal,
        setFeedbackModalData,
        index,
        runId,
        true // isUpvote: true for like
      ),
    ]);

    // Let the extension handle the user ID generation and feedback sending
    const messageBody = JSON.stringify({
      "data": {
        thread_id: messages.chatId,
        run_id: runId,
        is_upvote: true,
        feedback_text: "",
        sender: "vscode_assistant"
      }
    });

    tsvscode.postMessage({
      command: "vscode-couchbase.assistant.sendFeedback",
      value: {
        messageBody,
        updatedMessages,
      },
    });

    setFeedbackModalData({
      msgIndex: index,
      runId: runId,
      isUpvote: true
    });
  };

  const handleMessageDislike = (index: number, runId: string) => {
    
    
    const newMessage: userMessage = {
      message:
        "Oh! We are very sorry. Can you please give us additional info via feedback?",
      sender: "feedback",
      msgDate: (Date.now() / 1000).toFixed(0),
      runId: runId,
      feedbackSent: false,
    };

    const messagesCopy = [...messages.userChats];
    messagesCopy[index].feedbackSent = true;

    const updatedMessages = [...messagesCopy, newMessage];
    setMessages({
      chatId: messages.chatId,
      userChats: updatedMessages,
    });

    // Add Send Feedback button to the action bar
    setActions([
      ChatAction(
        "Send Feedback",
        setShowFeedbackModal,
        setFeedbackModalData,
        index,
        runId,
        false // isUpvote: false for dislike
      ),
    ]);

    // Let the extension handle the user ID generation and feedback sending
    const messageBody = JSON.stringify({
      "data": {
        thread_id: messages.chatId,
        run_id: runId,
        is_upvote: false,
        feedback_text: "",
        sender: "vscode_assistant"
      }
    });

    tsvscode.postMessage({
      command: "vscode-couchbase.assistant.sendFeedback",
      value: {
        messageBody,
        updatedMessages,
      },
    });

    setFeedbackModalData({
      msgIndex: index,
      runId: runId,
      isUpvote: false
    });
  };

  const handleFeedbackSubmit = (feedbackText: string) => {
    
    if (feedbackText.trim() === "") {
      return;
    }
    
    let runId = feedbackModalData.runId;
    let isUpvote = feedbackModalData.isUpvote;
    
    // Let the extension handle the user ID generation and feedback sending
    const messageBody = JSON.stringify({
      "data": {
        thread_id: messages.chatId,
        run_id: runId,
        is_upvote: isUpvote, // Maintain the original like/dislike value
        feedback_text: feedbackText,
        sender: "vscode_assistant"
      }
    });

    // Add a confirmation message
    const confirmationMessage: userMessage = {
      message: "Thanks for the feedback! We appreciate your input to help improve the assistant.",
      sender: "feedback",
      msgDate: (Date.now() / 1000).toFixed(0),
      runId: runId,
      feedbackSent: false,
    };

    // Update messages with the confirmation
    const updatedMessages = [...messages.userChats, confirmationMessage];
    setMessages({
      chatId: messages.chatId,
      userChats: updatedMessages,
    });

    tsvscode.postMessage({
      command: "vscode-couchbase.assistant.sendFeedback",
      value: {
        messageBody,
        updatedMessages,
      },
    });
    
    // Clear the actions after feedback submission
    setActions([]);
    
    // Close the feedback modal
    setShowFeedbackModal(false);
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
            ref={messageListRef as any}
            autoScrollToBottom={true}
            autoScrollToBottomOnMount={true}
            actionbar={
              isTyping ? (
                <TypingIndicator
                  content="Assistant is typing"
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
                                handleMessageLike(index, message.runId)
                              }
                            >
                              <ThumbsUp />
                            </button>
                            <button
                              className="dislikeButton iconButton"
                              onClick={() =>
                                handleMessageDislike(index, message.runId)
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
              value={inputValue}
              onChange={setInputValue}
              sendButton
              placeholder="Type a message..."
              onSend={() => {
                const cleanText = inputValue
                    .replace(/<br\s*\/?>/gi, "\n") // Replace <br> tags with newlines
                    .replace(/&nbsp;/g, " ") // Replace &nbsp; with spaces
                    .replace(/&lt;/g, "<") // Replace HTML entities
                    .replace(/&gt;/g, ">")
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&amp;/g, "&") // Unescape ampersand last
                    .replace(/\r?\n/g, "\n"); // Normalize line breaks
                handleSendRequest(cleanText);
                setInputValue("");
              }}
              onPaste={(event) => {
                event.preventDefault();
                  setInputValue(
                      event.clipboardData.getData("text")
                  );
               }}
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

export default AssistantChat;
