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

const IqChat = () => {
    const [messages, setMessages] = useState([
        {
            message: "Hello, I'm ChatGPT! Ask me anything!",
            sentTime: "just now",
            sender: "ChatGPT",
            position: "single",
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const handleSendRequest = async (message) => {
        const newMessage = {
            message,
            direction: "outgoing",
            sender: "user",
        };

        // setMessages((prevMessages) => [...prevMessages, newMessage]);
        setIsTyping(true);

        try {
                // setMessages((prevMessages) => [
                //     ...prevMessages,
                //     chatGPTResponse,
                // ]);
            
        } catch (error) {
            console.error("Error processing message:", error);
        } finally {
            setIsTyping(false);
        }
    };

    async function processMessageToChatGPT(chatMessages) {
        const apiMessages = chatMessages.map((messageObject) => {
            const role =
                messageObject.sender === "ChatGPT" ? "assistant" : "user";
            return { role, content: messageObject.message };
        });
    }

    // return (
    //     <div className="App">
    //         <div
    //             style={{
    //                 position: "relative",
    //                 height: "800px",
    //                 width: "700px",
    //             }}
    //         >
    //             <MainContainer>
    //                 <ChatContainer>
    //                     <MessageList
    //                         scrollBehavior="smooth"
    //                         typingIndicator={
    //                             isTyping ? (
    //                                 <TypingIndicator content="ChatGPT is typing" />
    //                             ) : null
    //                         }
    //                     >
    //                         {messages.map((message, i) => {
    //                             console.log(message);
    //                            return  <Message
    //                             model={{
    //                                 message: "Hello my friend",
    //                                 sentTime: "just now",
    //                                 sender: "Joe",
    //                             }}
    //                             />
    //                         })}
    //                     </MessageList>
    //                     <MessageInput
    //                         placeholder="Send a Message"
    //                         onSend={handleSendRequest}
    //                     />
    //                 </ChatContainer>
    //             </MainContainer>
    //         </div>
    //     </div>
    // );

    return (
        <MainContainer>
          <ChatContainer>
            <MessageList>
              {messages.map((message, index) => (
                <Message
                  key={index}
                  model={{
                    message: message.message,
                    direction: message.sender === 'User1' ? 'outgoing' : 'incoming',
                    sender: message.sender,
                    position: 0
                  }}
                />
              ))}
            </MessageList>
            <MessageInput attachButton={false} sendButton={true} placeholder="Type a message..." />
          </ChatContainer>
        </MainContainer>
      );
    };

export default IqChat;
