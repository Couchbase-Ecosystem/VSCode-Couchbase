import * as React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./index.css";
import { Editor } from "components/editor";

const container = document.getElementById("root");
const root = createRoot(container);

const FALLBACK_MESSAGE = {
  "No data to display": "Hit 'run' button to run query.",
};

export const App: React.FC = () => {
  const [queryResult, setQueryResult] = React.useState<Record<string, unknown>[]>(undefined);
  window.addEventListener('message', event => {
    const message = event.data; // The JSON data our extension sent
  
    switch (message.command) {
      case 'queryResult':
        setQueryResult(message.result.rows);
        break;
    }
  });
  return (
      <div className="h-[300px]">
        <Editor
          value={JSON.stringify(queryResult ?? FALLBACK_MESSAGE, null, 2)}
          fontSize={13}
          height="100%"
          readOnly
          theme="vs-dark"
          language="json"
        />
        {/* <DataTable data={hotels} dataFallback={[FALLBACK_MESSAGE]} /> */}
      </div>
  );
};
root.render(<App />);
