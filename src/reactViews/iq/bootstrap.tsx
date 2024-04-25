import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import { IqLogin } from "./pages/login/Login";
import LoadingScreen from "./pages/loader/Loader";
import SelectOrganizationPage from "./pages/organizationSelect/SelectOrganization";
import LoginSingleClick from "./pages/login/LoginSingleClick";
import IqChat from "./pages/chatscreen/IqChat";
import { Modal } from "./components/modals/Modal";
import { ModaliQTerm } from "./components/modals/ModaliQTerms";

const container: HTMLElement = document.getElementById("vscodeRootIQ");
const newRoot = createRoot(container);

export const App: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [showPage, setShowPage] = React.useState(<></>);
  const [showTermsModal, setShowTermsModal] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false); 
  const [organizationDetails, setOrganizationDetails] = React.useState(null);
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
        setShowModal(true);
        setErrorMessage(message.error || "");
        break;
      }
      case "vscode-couchbase.iq.acceptSupplementalTerms": {
        setIsLoading(false);
        setShowTermsModal(true);
        setOrganizationDetails(message.organization);
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

  const handleModalClose = () => {
    setShowTermsModal(false);
    tsvscode.postMessage({
      command: "vscode-couchbase.iq.cancelIqSupplementalTerms",
      value: "",
    });
  };

  const handleAcceptTerms = () => {
    setShowTermsModal(false);
    tsvscode.postMessage({
      command: "vscode-couchbase.iq.acceptIqSupplementalTerms",
      value: organizationDetails,
    });
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
      {showTermsModal && (
        <ModaliQTerm
          isOpen={showTermsModal}
          content={errorMessage || <></>}
          onClose={handleModalClose}
          onAccept={handleAcceptTerms}
        />
      )}
      {showModal && (
        <Modal
          isOpen={showModal}
          content={errorMessage || <></>}
          onClose={() => {
            setShowModal(false);
            setShowPage(<IqLogin  setIsLoading={setIsLoading}/>);
            setIsLoading(false);
            tsvscode.postMessage({
              command: "vscode-couchbase.iq.getSavedLogin",
              value: "",
            });
          }}
        />
      )}
      {showPage}
    </div>
  );
};

newRoot.render(<App />);

export default App;
