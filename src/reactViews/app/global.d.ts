import * as _vscode from "vscode";

declare global {
  const tsvscode: {
    postMessage: (message: { command: string, query: string }) => void;
    getState: () => any;
    setState: (state: any) => void;
  };
  const apiBaseUrl: string;
}