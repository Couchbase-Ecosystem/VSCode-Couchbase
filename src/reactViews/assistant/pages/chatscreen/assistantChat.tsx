import { useEffect, useState } from "react";
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
  const [codeTheme, setCodeTheme] = useState(oneLight);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isChatCompleted, setIsChatCompleted] = useState(false);
  const [feedbackModalData, setFeedbackModalData] = useState({
    msgIndex: -1,
    runId: "firstMessage",
  });
  const [actions, setActions] = useState<IActionBarButton[]>([]);
  const [runningConversation, setRunningConversation] = useState<
    string | undefined
  >(undefined);
  console.log(showFeedbackModal, feedbackModalData);

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

  // Keeping the handle paste function here if some paste issue arises later
  // const handlePaste = (event) => {
  //   // Prevent the original paste action
  //   event.preventDefault();
  //   const text = event.clipboardData.getData("text/plain");
  //   const selection = window.getSelection();

  //   if (selection.rangeCount) {
  //     selection.deleteFromDocument();
  //     selection.getRangeAt(0).insertNode(document.createTextNode(text));
  //   }

  //   const inputEvent = new Event("input", { bubbles: true });
  //   event.target.dispatchEvent(inputEvent);
  // };

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
      const formattedError = parseErrorMessages(JSON.parse(error));
      setErrorMessage(formattedError);
    } catch {
      // Adding if error is not JSON type or it failed to parse
      setErrorMessage(error);
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
      case "vscode-couchbase.assistant.chatCompleted": {
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
              // onPaste={(event) => {
              //   handlePaste(event);
              // }}
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
