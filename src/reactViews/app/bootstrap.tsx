import * as React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./index.css";
import { Editor } from "components/editor";
import { DataTable } from "components/data-table";
import { QueryTabs, TAB_BAR_ITEMS, TabBarMenu } from "custom/tab-bar/tab-bar";
import { QueryStats } from "custom/query-stats/query-stats";
import { QueryStatsProps } from "custom/query-stats/query-stats.types";
import { VisualExplainPlan } from "components/visual-explain-plan";
import { Plan } from "types/plan";

const container = document.getElementById("root");
const root = createRoot(container);

const FALLBACK_MESSAGE = {
  "No data to display": "Hit 'run' button to run query.",
};

export const App: React.FC = () => {
  const [queryResult, setQueryResult] = React.useState<Record<string, unknown>[]>(undefined);
  const [queryStatus, setQueryStatus] = React.useState<QueryStatsProps | undefined>(undefined);
  const [explainPlan, setExplainPlan] = React.useState<Plan>(null);
  const [currentTab, setCurrentTab] = React.useState<QueryTabs>(QueryTabs.JSON); // TODO: initial value should be chart
  window.addEventListener('message', event => {
    const message = event.data; // The JSON data our extension sent
  
    switch (message.command) {
      case 'queryResult':
        setQueryResult(JSON.parse(message.result));
        setQueryStatus(message.queryStatus);
        setExplainPlan(JSON.parse(message.explainPlan));
        break;
    }
  });
  return (
    <div className="h-full">
      <QueryStats {...queryStatus} />
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
        {currentTab === QueryTabs.PLAN && <VisualExplainPlan plan={explainPlan} hideControls={false} />}
      </div>
      </div>
  );
};
root.render(<App />);
