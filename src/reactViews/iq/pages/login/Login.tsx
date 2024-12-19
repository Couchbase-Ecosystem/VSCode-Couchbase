import { useEffect, useState } from "react";
import "./LoginPage.scss";
import { HidePasswordIcon } from "./../../assets/icons/HidePassword";
import { ShowPasswordIcon } from "./../../assets/icons/ShowPassword";

interface IFormData {
    username: string;
    password: string;
    rememberMe: boolean;
}

export const IqLogin = ({ setIsLoading, logoutReason = "" }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleRememberMeChange = (event) => {
        setRememberMe(event.target.checked);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        let formData: IFormData = {
            username: username,
            password: password,
            rememberMe: rememberMe,
        };

        setIsLoading(true);

        tsvscode.postMessage({
            command: "vscode-couchbase.iq.login",
            value: formData,
        });
    };

    const handleNewAccountClick = () => {
        const link = "https://cloud.couchbase.com/sign-up";
        tsvscode.postMessage({
            command: "vscode-couchbase.iq.openLinkInBrowser",
            value: link,
        });
    };

    useEffect(() => {
        setIsLoading(false);
        tsvscode.postMessage({
            command: "vscode-couchbase.iq.showLogoutButton",
            value: {
                enabled: false,
            },
        });

        tsvscode.postMessage({
            command: "vscode-couchbase.iq.showNewChatButton",
            value: {
                enabled: false,
            },
        });
    }, []);

    return (
        <div className="login-page">
            <h1>Welcome to Capella iQ</h1>
            <p>
                Need a productivity boost? Try chatting with Capella iQ, our LLM
                powered AI Chat Service. Capella iQ is a generative AI-powered
                coding assistant that helps developers instantly become more
                productive.
            </p>
            <div className="capella-login-area">
                {logoutReason.length > 0 && (
                    <div className="logout-reason">{logoutReason}</div>
                )}
                <h2>Sign In to Capella</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Username:
                        <input
                            type="text"
                            value={username}
                            onChange={handleUsernameChange}
                            required
                        />
                    </label>
                    <label className="password-box-label">
                        Password:
                        <div className="password-box-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={handlePasswordChange}
                                required
                            />
                            <div
                                className="toggle-password-button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <HidePasswordIcon />
                                ) : (
                                    <ShowPasswordIcon />
                                )}
                            </div>
                        </div>
                    </label>
                    <div className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={handleRememberMeChange}
                        />
                        <label htmlFor="rememberMe">Remember me</label>
                        
                    </div>
                    <input
                        type="submit"
                        value="Sign in"
                        className="redButton"
                    />
                </form>
                <span id="create-account" onClick={handleNewAccountClick}>
                    Don't have an account yet?
                </span>
            </div>
        </div>
    );
};
