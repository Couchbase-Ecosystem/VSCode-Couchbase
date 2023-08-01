import * as React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./index.css";
import { DataTable } from "./components/data-table";
import hotels from "../mocks/query-results/hotel.json";


const container = document.getElementById("root");
const root = createRoot(container);

const FALLBACK_MESSAGE = {
  "No data to display": "Hit 'run' button to run query.",
};

const onclick = (e)=>{
  e.preventDefault();
  tsvscode.postMessage({type:"ReactWorks", value: "sent"});
};

export const App: React.FC = () => {
  
  return (
<div>
  <div className="h-[300px]" style={{ marginTop: "200px" }}>
    <DataTable data={hotels} dataFallback={[FALLBACK_MESSAGE]} />
  </div>
  <a onClick={onclick}>Mai hu jiyan</a>
</div>
  );
};
root.render(<App />);
