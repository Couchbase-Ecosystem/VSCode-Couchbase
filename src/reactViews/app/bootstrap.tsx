import * as React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { ButtonVariant } from "sharedComponents/components/button/button.types";
import { Button } from "sharedComponents/components/button";

const container = document.getElementById("root");
const root = createRoot(container);
const App: React.FC = () => {
  const submitButton: ButtonVariant = "secondary";
  return (
    <div className="container">
      <Button variant={submitButton}>Submit Button</Button>
    </div>
  );
};
root.render(<App />);