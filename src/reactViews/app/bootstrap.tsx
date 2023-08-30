import * as React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./index.css";
import { Editor } from "components/editor";
import { DataTable } from "components/data-table";
import { QueryTabs, TAB_BAR_ITEMS, TabBarMenu } from "./custom/tab-bar/tav-bar";

const container = document.getElementById("root");
const root = createRoot(container);

const FALLBACK_MESSAGE = {
  "No data to display": "Hit 'run' button to run query.",
};

export const App: React.FC = () => {
  const [queryResult, setQueryResult] = React.useState<Record<string, unknown>[]>(undefined);
  const [currentTab, setCurrentTab] = React.useState<QueryTabs>(QueryTabs.JSON); // TODO: initial value should be chart
  window.addEventListener('message', event => {
    const message = event.data; // The JSON data our extension sent
  
    switch (message.command) {
      case 'queryResult':
        setQueryResult(message.result.rows);
        break;
    }
  });
  return (
    <div className="h-full">
      <TabBarMenu items={TAB_BAR_ITEMS} value={currentTab} onChange={setCurrentTab} />
      <div className="h-[300px]" style={{marginTop: "3px"}}>
      {currentTab === QueryTabs.JSON && <Editor
          value={JSON.stringify(queryResult ?? FALLBACK_MESSAGE, null, 2)}
          fontSize={13}
          height="100%"
          readOnly
          theme="vs-dark"
          language="json"
        />}
        {currentTab === QueryTabs.Table && <DataTable data={queryResult} dataFallback={[FALLBACK_MESSAGE]} />}
      </div>
      </div>
  );
};
root.render(<App />);
