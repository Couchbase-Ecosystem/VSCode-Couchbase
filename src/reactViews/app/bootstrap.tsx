import * as React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./index.css";
import dayjs from "dayjs";
import { QueryEditor } from "sharedComponents/components/workbench/query-editor";
import { QueryEditorProps } from "sharedComponents/components/workbench/query-editor/query-editor.types";
import {
  QUERY,
  DATABASE_SCHEMA,
} from "../mocks/query-editor/query-editor-mocks";
import { DataTable } from "sharedComponents/components/data-table";
import hotels from "../mocks/query-results/hotel.json";

const container = document.getElementById("root");
const root = createRoot(container);

const FALLBACK_MESSAGE = {
  "No data to display": "Hit 'run' button to run query.",
};

export const App: React.FC = () => {
  const queryEditorProps: QueryEditorProps = {
    query: QUERY,
    onRun: () => {},
    queryStatus: "success",
    lastExecuted: dayjs().toString(),
    executionTime: "134.123344ms",
    numDocs: 216,
    databaseSchema: DATABASE_SCHEMA,
  };
  return (
<div>
  <div className="h-[300px]">
    <QueryEditor {...queryEditorProps} />
  </div>
  <div className="h-[300px]" style={{ marginTop: "200px" }}>
    <DataTable data={hotels} dataFallback={[FALLBACK_MESSAGE]} />
  </div>
</div>
  );
};
root.render(<App />);
