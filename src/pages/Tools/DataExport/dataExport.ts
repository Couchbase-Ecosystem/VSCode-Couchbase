import { CBExport } from "../../../tools/CBExport";
import {
  CBTools,
  Type as CBToolsType,
} from "../../../util/DependencyDownloaderUtils/CBTool";
import * as vscode from "vscode";
import { getActiveConnection } from "../../../util/connections";
import { Memory } from "../../../util/util";
import { Constants } from "../../../util/constants";
import { logger } from "../../../logger/logger";
import * as path from "path";
import { getLoader } from "../../../webViews/loader.webview";
import { dataExportWebview } from "../../../webViews/tools/dataExport.webview";
import { IConnection } from "../../../types/IConnection";

const getScopes = async (bucketId: string, connection: IConnection) => {
  const scopes = await connection.cluster
    ?.bucket(bucketId)
    .collections()
    .getAllScopes();
  return scopes;
};

const validateFormData = (formData: any): string => {
  const errors = [];

  if (!formData.bucket) {
    errors.push("Please select a bucket");
  } else {
    if (formData.scopes.length === 0) {
      errors.push("Select one or more scopes");
    } else {
      if (
        !formData.scopes.includes("All Scopes") &&
        formData.collections.length === 0
      ) {
        errors.push("Select one or more collections");
      }
    }
  }

  if (!formData.documentsKeyField.trim()) {
    errors.push("Please specify the document's key field name");
  }

  if (!formData.scopeFieldName.trim()) {
    errors.push("Please specify the scope field name");
  }

  if (!formData.collectionFieldName.trim()) {
    errors.push("Please specify the collection field name");
  }

  if (!formData.fileDestination.trim()) {
    errors.push("Please inform the file destination folder");
  }

  if (!formData.threads.trim() || parseInt(formData.threads) < 1) {
    errors.push("threads cannot be undefined or less than 1");
  }

  if (errors.length > 0) {
    return errors.join("<br>");
  }

  return "";
};

export interface IDataExportWebviewState {
  webviewPanel: vscode.WebviewPanel;
}

export const dataExport = async () => {
  const connection = getActiveConnection();
  if (!connection) {
    return;
  }
  if (!CBTools.getTool(CBToolsType.CB_EXPORT).isAvailable()) {
    vscode.window.showErrorMessage(
      "CB Export is still loading, Please try again later"
    );
    return;
  }

  const dataExportWebviewDetails = Memory.state.get<IDataExportWebviewState>(
    Constants.DATA_EXPORT_WEBVIEW
  );
  if (dataExportWebviewDetails) {
    // data export webview already exists, Closing existing and creating new
    try {
      dataExportWebviewDetails.webviewPanel.dispose();
    } catch (e) {
      logger.error("Error while disposing data export webview: " + e);
    }
    Memory.state.update(Constants.DATA_EXPORT_WEBVIEW, null);
  }

  const currentPanel = vscode.window.createWebviewPanel(
    "dataExport",
    "Data Export",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      enableForms: true,
    }
  );
  Memory.state.update(Constants.DATA_EXPORT_WEBVIEW, {
    webviewPanel: currentPanel,
  });
  currentPanel.iconPath = {
    dark: vscode.Uri.file(
      path.join(__filename, "..", "..", "images", "dark", "export_dark.svg")
    ),
    light: vscode.Uri.file(
      path.join(__filename, "..", "..", "images", "light", "export_light.svg")
    ),
  };
  currentPanel.webview.html = getLoader("Data Export");

  // Get all buckets
  const buckets = await connection.cluster?.buckets().getAllBuckets();
  if (buckets === undefined) {
    vscode.window.showErrorMessage("Buckets not found");
    return;
  }

  const bucketNameArr: string[] = buckets.map(b => b.name);

  try {
    currentPanel.webview.html = await dataExportWebview(bucketNameArr);
    currentPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        // ADD cases here :)
        case "vscode-couchbase.tools.dataExport.runExport":
          const formData = message.data;
          const validationError = validateFormData(formData);
          if (validationError === "") {
            // There is no error
            CBExport.export(
              formData.bucket,
              formData.scopes,
              formData.collections,
              formData.fileDestination,
              formData.documentsKeyField,
              formData.scopeFieldName,
              formData.collectionFieldName,
              formData.format,
              formData.threads,
              formData.verboseLog
            );
          } else {
            currentPanel.webview.postMessage({
              command: "vscode-couchbase.tools.dataExport.formValidationError",
              error: validationError,
            });
          }
          break;
        case "vscode-couchbase.tools.dataExport.getScopes":
          const scopes = await getScopes(message.bucketId, connection);
          if (scopes === undefined) {
            vscode.window.showErrorMessage("Scopes are undefined");
            break;
          }

          currentPanel.webview.postMessage({
            command: "vscode-couchbase.tools.dataExport.scopesInfo",
            scopes: scopes,
          });
          break;
        case "vscode-couchbase.tools.dataExport.getFolder":
          const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: "Choose Destination Folder",
            canSelectFiles: false,
            canSelectFolders: true,
          };

          vscode.window.showOpenDialog(options).then((fileUri) => {
            if (fileUri && fileUri[0]) {
              currentPanel.webview.postMessage({
                command: "vscode-couchbase.tools.dataExport.folderInfo",
                folder: fileUri[0].fsPath,
              });
            }
          });
          break;
      }
    });
  } catch (err) {
    logger.error(`Failed to open data export webview`);
    logger.debug(err);
    vscode.window.showErrorMessage(
      "Failed to open data export webview: " + err
    );
  }

  currentPanel.onDidDispose(() => {
    Memory.state.update(Constants.DATA_EXPORT_WEBVIEW, null);
  });
};
