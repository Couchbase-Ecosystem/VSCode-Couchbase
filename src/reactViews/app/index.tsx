/* eslint-disable @typescript-eslint/naming-convention */
import * as React from "react";
import { createRoot } from "react-dom/client";
 
const container = document.getElementById("root");
const root = createRoot(container);
const App: React.FC = () => {
  return <h1>Hello Workbench!!!</h1>;
  };
root.render(<App />);