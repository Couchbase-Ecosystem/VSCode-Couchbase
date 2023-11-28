import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import { Login } from "pages/login/Login";
import LoadingScreen from "pages/loader/Loader";
import SelectOrganizationPage from "pages/organizationSelect/SelectOrganization";
import LoginSingleClick from "pages/login/LoginSingleClick";
import IqChat from "pages/chatscreen/IqChat";

const container: HTMLElement = document.getElementById("vscodeRootIQ");
const newRoot = createRoot(container);

export const App: React.FC = () => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [showPage, setShowPage] = React.useState(<></>);

    window.addEventListener("message", (event) => {
        const message = event.data;
        switch (message.command) {
            case "vscode-couchbase.iq.organizationDetails": {
                if(message.isSavedOrganization){
                    // Organization is already saved, bypass the organization select page straight to IQ Chat
                    setShowPage(<IqChat org={message.savedOrganizationDetail}/>);
                } else {
                    setShowPage(<SelectOrganizationPage organizationDetails={message.organizations} setShowPage={setShowPage}/>);
                }
                setIsLoading(false);
                break;
            }
            case "vscode-couchbase.iq.forcedLogout": {
                setShowPage(<Login logoutReason={message.error || ""} />);
                setIsLoading(false);
                break;
            }
            case "vscode-couchbase.iq.savedLoginDetails": {
                if (message.savedLoginDetails.doesLoginDetailsExists === true){
                    setShowPage(<LoginSingleClick setShowPage={setShowPage} userId={message.savedLoginDetails.username}/>);
                } else {
                    setShowPage(<Login />);
                }
                setIsLoading(false);
                break;
            }
            case "vscode-couchbase.iq.sendLogoutRequest": {
                setShowPage(<Login logoutReason="You have been successfully logged out"/>);
                break;
            }
        }
    });

    React.useEffect(()=>{
        tsvscode.postMessage(
            {
                command: "vsode-couchbase.iq.getSavedLogin",
                value: ""
            }
        );
    }, []);

    return (
        <div>
            {isLoading && <LoadingScreen />}
            {showPage}
        </div>
    );
};

newRoot.render(<App />);

export default App;
