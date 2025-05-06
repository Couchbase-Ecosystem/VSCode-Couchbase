import { IActionBarButton } from "./../chatscope/src/components/ActionBar/ActionBar";

export const availableActions = [
  "Data Import",
  "Send Feedback",
  "Data Export",
  "DDL Export",
  "Open Query Editor",
  "Open SQL++ Notebook",
];

export const ChatAction = (
  actionName: string,
  ...args: any[]
): IActionBarButton => {
  switch (actionName) {
    case "Data Import": {
      return {
        name: "Data Import",
        onclick: () => {
          tsvscode.postMessage({
            command: "vscode-couchbase.iq.executeActionCommand",
            value: "vscode-couchbase.tools.dataImport",
          });
        },
      };
    }
    case "Data Export": {
      return {
        name: "Data Export",
        onclick: () => {
          tsvscode.postMessage({
            command: "vscode-couchbase.iq.executeActionCommand",
            value: "vscode-couchbase.tools.dataExport",
          });
        },
      };
    }
    case "DDL Export": {
      return {
        name: "DDL Export",
        onclick: () => {
          tsvscode.postMessage({
            command: "vscode-couchbase.iq.executeActionCommand",
            value: "vscode-couchbase.tools.DDLExport",
          });
        },
      };
    }
    case "Open Query Editor": {
      return {
        name: "Open Query Editor",
        onclick: () => {
          tsvscode.postMessage({
            command: "vscode-couchbase.iq.executeActionCommand",
            value: "vscode-couchbase.openQueryWorkbench",
          });
        },
      };
    }
    case "Open SQL++ Notebook": {
      return {
        name: "Open SQL++ Notebook",
        onclick: () => {
          tsvscode.postMessage({
            command: "vscode-couchbase.iq.executeActionCommand",
            value: "vscode-couchbase.openQueryNotebook",
          });
        },
      };
    }
    case "Send Feedback": {
      const [setShowFeedbackModal, setFeedbackModalData, index, runId, isUpvote] = args;
      return {
        name: "Send Feedback",
        onclick: () => {
          setShowFeedbackModal(true);
          setFeedbackModalData({
            msgIndex: index,
            runId: runId,
            isUpvote: isUpvote
          });
        },
      };
    }
  }
  return undefined;
};
