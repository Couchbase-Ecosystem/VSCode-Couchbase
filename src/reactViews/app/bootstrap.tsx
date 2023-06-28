/* eslint-disable @typescript-eslint/naming-convention */
// @ts-nocheck
import * as React from "react";
import { createRoot } from "react-dom/client";
import './index.css';
import Counter from "remote/Counter";

const container = document.getElementById("root");
const root = createRoot(container);
const App: React.FC = () => {
  return (
    <div className="container">
      <Counter />
    </div>
  );
};
root.render(<App />);