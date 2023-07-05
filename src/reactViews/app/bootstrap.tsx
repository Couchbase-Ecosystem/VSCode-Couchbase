import * as React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import './index.css';

const container = document.getElementById("root");
const root = createRoot(container);
const App: React.FC = () => {
  return (
    <div className="container">
          <div className="container">
      <img
        src="https://www.couchbase.com/wp-content/uploads/2022/08/CB-logo-R_B_B.png"
        alt="New Workbench Feature Coming Soon"
      />
      <br />
      <br />
      <h1>A New Workbench Feature Is Coming Soon</h1>
      <br />
      <h3>Stay Tuned!</h3>
    </div>
    </div>
  );
};
root.render(<App />);