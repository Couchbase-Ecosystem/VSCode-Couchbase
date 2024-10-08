import * as React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./index.scss";
import { Editor } from "components/editor";
import { DataTable } from "components/data-table";
import { QueryTabs, TAB_BAR_ITEMS, TabBarMenu } from "custom/tab-bar/tab-bar";
import { QueryStats } from "custom/query-stats/query-stats";
import { QueryStatsProps } from "custom/query-stats/query-stats.types";
import { VisualExplainPlan } from "components/visual-explain-plan";
import { Plan } from "types/plan";
import { SupportedThemes } from "components/editor/editor.types";
import { getIdentifiedData } from "components/data-table/data-table.utils";

const container = document.getElementById("root");
const root = createRoot(container);

const FALLBACK_MESSAGE = {
  "No data to display": "Hit 'run' button to run query.",
};

export const App: React.FC = () => {
  const [queryResult, setQueryResult] = React.useState<Record<string, unknown>[]>(undefined);
  const [queryStatus, setQueryStatus] = React.useState<QueryStatsProps | undefined>(undefined);
  const [explainPlan, setExplainPlan] = React.useState<Plan>(null);
  const [theme, setTheme] = React.useState<SupportedThemes>("vs-dark");
  const [currentTab, setCurrentTab] = React.useState<QueryTabs>(QueryTabs.JSON); // TODO: initial value should be chart
  const [isSearch, setIsSearch] = React.useState(false);

  window.addEventListener('message', event => {
    const message = event.data; // The JSON data our extension sent

    switch (message.command) {
      case 'queryResult':
        setQueryResult(JSON.parse(message.result));
        setQueryStatus(message.queryStatus);
        setIsSearch(message.isSearch);
        if (!message.isSearch) {
        setExplainPlan(JSON.parse(message.explainPlan));
        }
        message.isDarkTheme ? setTheme("vs-dark") : setTheme("vs-light");
        break;
      case 'theme':
        message.isDarkTheme ? setTheme("vs-dark") : setTheme("vs-light");
        break;
    }
  });

  const tableValue = React.useMemo(() => {
    const result = queryResult && queryResult.length < 1 ? [{ '': [] }] : queryResult;
    return result ? getIdentifiedData(result) : result;
  }, [queryResult]);

  return (
    <div className="h-screen">
      <QueryStats {...queryStatus} />
      <TabBarMenu items={isSearch ? TAB_BAR_ITEMS.filter(item => item.key === QueryTabs.JSON) : TAB_BAR_ITEMS} value={currentTab} onChange={setCurrentTab} />
      <div style={{ height: 'calc(100vh - 80px)', marginTop: '3px' }}>
        {currentTab === QueryTabs.JSON && <Editor
          value={JSON.stringify(queryResult ?? FALLBACK_MESSAGE, null, 2)}
          fontSize={13}
          height="100%"
          readOnly
          theme={theme}
          language="json"
        />}
        {!isSearch && currentTab === QueryTabs.Table && <DataTable data={tableValue} dataFallback={[FALLBACK_MESSAGE]} />}
        {!isSearch && currentTab === QueryTabs.PLAN && <VisualExplainPlan plan={explainPlan} hideControls={false} />}
      </div>
    </div>
  );
};
root.render(<App />);
