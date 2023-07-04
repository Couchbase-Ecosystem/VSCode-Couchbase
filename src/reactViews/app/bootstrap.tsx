import * as React from "react";
import { BrowserRouter as Router } from 'react-router-dom';
import { createRoot } from "react-dom/client";
import "./styles.css";
import { QueryResults } from "sharedComponents/components/query-results";
import hotels from '../mocks/query-results/hotel.json';

const container = document.getElementById("root");
const root = createRoot(container);

export const App: React.FC = () => {
  return (
    <div className="h-[300px]">
      <QueryResults queryResults={hotels} />
    </div>
  );
};
root.render(<Router><App /></Router>);
