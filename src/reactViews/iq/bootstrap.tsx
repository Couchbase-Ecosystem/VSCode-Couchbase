import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import { Login } from "pages/login/Login";
import LoadingScreen from "pages/loader/Loader";
import SelectOrganizationPage from "pages/organizationSelect/SelectOrganization";

const container: HTMLElement = document.getElementById("vscodeRootIQ");
const newRoot = createRoot(container);

export const App: React.FC = () => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [showPage, setShowPage] = React.useState(<Login />);
    window.addEventListener("message", (event) => {
        const message = event.data;
        switch (message.command) {
            case "vscode-couchbase.iq.organizationDetails": {
                setShowPage(<SelectOrganizationPage />);
                setIsLoading(false);
            }
        }
    });

    return (
        <div>
            {isLoading && <LoadingScreen />}
            {showPage}
        </div>
    );
};

newRoot.render(<App />);

export default App;
