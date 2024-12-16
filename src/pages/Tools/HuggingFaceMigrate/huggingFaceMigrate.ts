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
import { IConnection } from "../../../types/IConnection";
import { huggingFaceMigrateWebView } from "../../../webViews/tools/huggingFaceImporter.webview";
import { HuggingFaceToCouchbase } from "../../../tools/HFMigrate";

export const getScopes = async (bucketId: string, connection: IConnection) => {
  const scopes = await connection.cluster
    ?.bucket(bucketId)
    .collections()
    .getAllScopes();
  return scopes;
};

// Validate form data for Hugging Face migration
const validateFormData = (formData: any): string => {
  const errors = [];
  return "";
};

export interface IDataMigrateWebviewState {
  webviewPanel: vscode.WebviewPanel;
}

export const huggingFaceMigrate = async () => {
  const connection = getActiveConnection();
  if (!connection) {
    return;
  }
  if (!CBTools.getTool(CBToolsType.CB_MIGRATE).isAvailable()) {
    vscode.window.showErrorMessage(
      "CB Migrate is still loading, Please try again later"
    );
    return;
  }

  const dataMigrateWebviewDetails =
    Memory.state.get<IDataMigrateWebviewState>(
      Constants.DATA_MIGRATE_HUGGING_FACE_WEBVIEW
    );
  if (dataMigrateWebviewDetails) {
    // Dispose of the existing webview and create a new one
    try {
      dataMigrateWebviewDetails.webviewPanel.dispose();
    } catch (e) {
      logger.error("Error while disposing data migrate webview: " + e);
    }
    Memory.state.update(Constants.DATA_MIGRATE_HUGGING_FACE_WEBVIEW, null);
  }

  const currentPanel = vscode.window.createWebviewPanel(
    "dataMigrate",
    "Data Migration from HF to CB",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      enableForms: true,
      retainContextWhenHidden: true,
    }
  );
  Memory.state.update(Constants.DATA_MIGRATE_HUGGING_FACE_WEBVIEW, {
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
  currentPanel.webview.html = getLoader("Hugging Face Importer");

  // Get all buckets
  const buckets = await connection.cluster?.buckets().getAllBuckets();
  if (buckets === undefined) {
    vscode.window.showErrorMessage("Buckets not found");
    return;
  }

  const bucketNameArr: string[] = buckets.map((b) => b.name);

  try {
    currentPanel.webview.html = await huggingFaceMigrateWebView(bucketNameArr);
    currentPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "vscode-couchbase.tools.huggingFaceMigrate.listConfigs":
          try {
            const configs = await HuggingFaceToCouchbase.listConfigs(
              message.repositoryPath
            );
            currentPanel.webview.postMessage({
              command:
                "vscode-couchbase.tools.huggingFaceMigrate.configsInfo",
              configs,
            });
          } catch (error) {
            logger.error("Error listing configs: " + error);
            currentPanel.webview.postMessage({
              command: "vscode-couchbase.tools.huggingFaceMigrate.error",
              error: "Failed to list configs: " + error,
            });
          }
          break;

        case "vscode-couchbase.tools.huggingFaceMigrate.listSplits":
          try {
            const splits = await HuggingFaceToCouchbase.listSplits(
              message.repositoryPath,
              message.config
            );
            currentPanel.webview.postMessage({
              command:
                "vscode-couchbase.tools.huggingFaceMigrate.splitsInfo",
              splits,
            });
          } catch (error) {
            logger.error("Error listing splits: " + error);
            currentPanel.webview.postMessage({
              command: "vscode-couchbase.tools.huggingFaceMigrate.error",
              error: "Failed to list splits: " + error,
            });
          }
          break;

        case "vscode-couchbase.tools.huggingFaceMigrate.listFields":
          try {
            const fields = await HuggingFaceToCouchbase.listFields(
              message.repositoryPath
            );
            currentPanel.webview.postMessage({
              command:
                "vscode-couchbase.tools.huggingFaceMigrate.fieldsInfo",
              fields,
            });
          } catch (error) {
            logger.error("Error listing fields: " + error);
            currentPanel.webview.postMessage({
              command: "vscode-couchbase.tools.huggingFaceMigrate.error",
              error: "Failed to list fields: " + error,
            });
          }
          break;

          case "vscode-couchbase.tools.huggingFaceMigrate.listScopes":
            try {
              const scopes = await getScopes(message.bucketId, connection);
              if (scopes === undefined) {
                vscode.window.showErrorMessage("Scopes are undefined");
                break;
              }
              currentPanel.webview.postMessage({
                command: "vscode-couchbase.tools.huggingFaceMigrate.scopesInfo",
                scopes: scopes,
              });
            } catch (error) {
              logger.error("Error fetching scopes: " + error);
              currentPanel.webview.postMessage({
                command: "vscode-couchbase.tools.huggingFaceMigrate.error",
                error: "Failed to fetch scopes: " + error,
              });
            }
            break;

        case "vscode-couchbase.tools.huggingFaceMigrate.export":
          try {
            const formData = message.data;
            const validationError = validateFormData(formData);
            if (validationError === "") {
              // No validation errors, proceed with export
              await HuggingFaceToCouchbase.export(
                formData.repoLink,
                formData.config,
                formData.split,
                formData.bucket,
                formData.scope,
                formData.collection
              );
              currentPanel.webview.postMessage({
                command: "vscode-couchbase.tools.huggingFaceMigrate.exportSuccess",
              });
            } else {
              currentPanel.webview.postMessage({
                command:
                  "vscode-couchbase.tools.huggingFaceMigrate.formValidationError",
                error: validationError,
              });
            }
          } catch (error) {
            logger.error("Error during export: " + error);
            currentPanel.webview.postMessage({
              command: "vscode-couchbase.tools.huggingFaceMigrate.error",
              error: "Failed to export data: " + error,
            });
          }
          break;
      }
    });
  } catch (err) {
    logger.error(`Failed to open data migrate webview`);
    logger.debug(err);
    vscode.window.showErrorMessage(
      "Failed to open data migrate webview: " + err
    );
  }

  currentPanel.onDidDispose(() => {
    Memory.state.update(Constants.DATA_MIGRATE_HUGGING_FACE_WEBVIEW, null);
  });
};