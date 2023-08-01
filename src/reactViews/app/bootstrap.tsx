import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { DataTable } from "./components/data-table";
import hotels from "../mocks/query-results/hotel.json";


const container = document.getElementById("root");
const root = createRoot(container);

const FALLBACK_MESSAGE = {
  "No data to display": "Hit 'run' button to run query.",
};



export const App: React.FC = () => {
  const [queryResult, setQueryResult] = React.useState<Record<string, unknown>[]>(undefined);
  const handleClick = (e) => {
    e.preventDefault();
    tsvscode.postMessage({ command: "runQuery", query: query });
  };
  window.addEventListener('message', event => {

    const message = event.data; // The JSON data our extension sent

    switch (message.command) {
      case 'queryResult':
        setQueryResult(message.result.rows);
        break;
    }
  });

  const [query, setQuery] = React.useState('SELECT a.country FROM default:`travel-sample`.inventory.airline a WHERE a.name = "Excel Airways"');

  const handleChange = ({ target }) => {
    setQuery(target.value);
  };
  return (
    <div className="container">
      <div className="h-[300px]" style={{ marginTop: "200px" }}>
        <DataTable data={hotels} dataFallback={[FALLBACK_MESSAGE]} />
      </div>
      <textarea
        className="big-input"
        name="query"
        placeholder="Enter Query here..."
        value={query}
        onChange={handleChange}
      />
      <button className="query-button" onClick={handleClick}>
        Run Query
      </button>
      <div className="query-result-box">
        <pre>{JSON.stringify(queryResult, null, 2)}</pre>
      </div>
    </div>
  );
};
root.render(<App />);
