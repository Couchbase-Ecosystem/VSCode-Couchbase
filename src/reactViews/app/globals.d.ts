import * as _vscode from "vscode";

declare global {
  const tsvscode: {
    postMessage: (message: { type: string, value: any }) => void;
    getState: () => any;
    setState: (state: any) => void;
  };
  const apiBaseUrl: string;
}