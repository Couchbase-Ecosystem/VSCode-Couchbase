import { useEffect } from 'react';
import './Loader.scss';

const LoadingScreen = () => {
  useEffect(() => {
    tsvscode.postMessage({
      command: "vscode-couchbase.iq.showLogoutButton",
      value: {
        enabled: true
      }
    });

    tsvscode.postMessage({
      command: "vscode-couchbase.iq.showNewChatButton",
      value: {
        enabled: false
      }
    });
  }, []);
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
};

export default LoadingScreen;