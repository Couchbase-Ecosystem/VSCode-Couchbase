import * as React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { Button } from "sharedComponents/components/button";

// FIXME: Look into importing the styles.css file from the built 
const container = document.getElementById("root");
const root = createRoot(container);
const App: React.FC = () => {
  return (
    <div className="container">
      <Button>Some text</Button>
    </div>
  );
};
root.render(<App />);