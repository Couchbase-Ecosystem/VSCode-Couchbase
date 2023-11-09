import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import {Login} from "pages/login/Login";

const container:HTMLElement = document.getElementById("vscodeRootIQ");
const newRoot = createRoot(container);

export const App: React.FC = () => {
  return (
    <div>
      <Login />
    </div>
  );
};

newRoot.render(<App />);
