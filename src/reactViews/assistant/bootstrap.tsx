import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import { IqLogin } from "./pages/login/Login";
// import LoadingScreen from "./pages/loader/Loader";
import AssistantChat from "pages/chatscreen/assistantChat";

const container: HTMLElement = document.getElementById("vscodeRootIQ");
const newRoot = createRoot(container);

export const App: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPage, setShowPage] = React.useState(<></>);
  const [errorMessage, setErrorMessage] = React.useState(<></>);
  console.log(errorMessage, isLoading);

  const messageHandler = (event) => {
    const message = event.data;
    switch (message.command) {
      case "vscode-couchbase.iq.forcedLogout": {
        tsvscode.postMessage({
          command: "vscode-couchbase.assistant.removeSavedJWT",
          value: "",
        });
        setIsLoading(false);
        setErrorMessage(message.error || "");
        break;
      }
      case "vscode-couchbase.iq.sendLogoutRequest": {
        tsvscode.postMessage({
          command: "vscode-couchbase.assistant.removeSavedJWT",
          value: "",
        });
        
        setShowPage(
          <IqLogin setIsLoading={setIsLoading} logoutReason="You have been successfully logged out" />
        );
        setIsLoading(false);
        break;
      }
    }
  };


  React.useEffect(() => {
    window.addEventListener("message", messageHandler);

    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, []);

  React.useEffect(() => {
    // tsvscode.postMessage({
    //   command: "vscode-couchbase.iq.getSavedLogin",
    //   value: "",
    // });

    setShowPage(<AssistantChat setIsLoading={setIsLoading}/>)
  }, []);

  return (
    <div>
      {/* {isLoading && <LoadingScreen />} */}
      {showPage}
    </div>
  );
};

newRoot.render(<App />);

export default App;
