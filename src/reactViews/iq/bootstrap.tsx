import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import { IqLogin } from "pages/login/Login";
import LoadingScreen from "pages/loader/Loader";
import SelectOrganizationPage from "pages/organizationSelect/SelectOrganization";
import LoginSingleClick from "pages/login/LoginSingleClick";
import IqChat from "pages/chatscreen/IqChat";
import { Modal } from "components/modals/Modal";

const container: HTMLElement = document.getElementById("vscodeRootIQ");
const newRoot = createRoot(container);

export const App: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [showPage, setShowPage] = React.useState(<></>);
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(<></>);

  const messageHandler = (event) => {
    const message = event.data;
    switch (message.command) {
      case "vscode-couchbase.iq.organizationDetails": {
        if (message.isSavedOrganization) {
          // Organization is already saved, bypass the organization select page straight to iQ Chat
          setShowPage(<IqChat org={message.savedOrganization} setIsLoading={setIsLoading} />);
        } else {
          setShowPage(
            <SelectOrganizationPage
              organizationDetails={message.organizations}
              setShowPage={setShowPage}
              setIsLoading={setIsLoading}
            />
          );
        }
        setIsLoading(false);
        break;
      }
      case "vscode-couchbase.iq.forcedLogout": {
        tsvscode.postMessage({
          command: "vscode-couchbase.iq.removeSavedJWT",
          value: "",
        });
        setIsLoading(false);
        setShowErrorModal(true);
        setErrorMessage(message.error || "");
        break;
      }
      case "vscode-couchbase.iq.savedLoginDetails": {
        if (message.savedLoginDetails.doesLoginDetailsExists === true) {
          setShowPage(
            <LoginSingleClick
              setIsLoading={setIsLoading}
              setShowPage={setShowPage}
              userId={message.savedLoginDetails.username}
            />
          );
        } else {
          setShowPage(<IqLogin setIsLoading={setIsLoading}/>);
        }
        setIsLoading(false);
        break;
      }
      case "vscode-couchbase.iq.sendLogoutRequest": {
        tsvscode.postMessage({
          command: "vscode-couchbase.iq.removeSavedJWT",
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
    tsvscode.postMessage({
      command: "vscode-couchbase.iq.getSavedLogin",
      value: "",
    });
  }, []);

  return (
    <div>
      {isLoading && <LoadingScreen />}
      <Modal
        isOpen={showErrorModal}
        content={errorMessage || <></>}
        onClose={() => {
          setShowErrorModal(false);
          setShowPage(<IqLogin  setIsLoading={setIsLoading}/>);
          setIsLoading(false);
          tsvscode.postMessage({
            command: "vscode-couchbase.iq.getSavedLogin",
            value: "",
          });
        }}
      />
      {showPage}
    </div>
  );
};

newRoot.render(<App />);

export default App;
