import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";

const container:HTMLElement = document.getElementById("vscodeRootIQ");
const newRoot = createRoot(container);

export const App: React.FC = () => {
  return (
    <div>
      <p>Hello Couchbase IQ</p>
    </div>
  );
};

newRoot.render(<App />);
