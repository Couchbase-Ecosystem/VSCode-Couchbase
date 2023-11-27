import { Login } from "./Login";
import "./LoginPage.scss";

const LoginSingleClick = ({ userId, setShowPage, logoutReason = "" }) => {
    const singleClickSignIn = () => {
        tsvscode.postMessage({
            command: "vscode-couchbase.iq.singleClickSignIn",
            value: {
                username: userId,
            },
        });
    };

    return (
        <div className="login-page">
            <h1>Welcome to Couchbase iQ</h1>
            <p>
                Need a productivity boost? Try chatting with Capella iQ, our AI
                cloud service. Capella iQ is a generative AI-powered coding
                assistant that helps developers instantly become more
                productive.
            </p>
            <div className="capella-login-area">
                {logoutReason.length > 0 && (
                    <div className="logout-reason">{logoutReason}</div>
                )}
                <h2>Sign In to Capella</h2>
                <button
                    className="redButton"
                    onClick={() => {
                        singleClickSignIn();
                    }}
                >
                    Sign in as {userId}
                </button>

                <div className="orArea">OR</div>

                <button
                    className=""
                    onClick={() => {
                        setShowPage(<Login />);
                    }}
                >
                    Login with different credentials
                </button>
            </div>
        </div>
    );
};

export default LoginSingleClick;
