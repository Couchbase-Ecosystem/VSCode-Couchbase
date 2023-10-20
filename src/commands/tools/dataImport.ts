import {
  CBTools,
  Type as CBToolsType,
} from "../../util/DependencyDownloaderUtils/CBTool";
import { getActiveConnection } from "../../util/connections";
import * as vscode from "vscode";
import * as path from "path";
import { Memory } from "../../util/util";
import { Constants } from "../../util/constants";
import { logger } from "../../logger/logger";
import { getLoader } from "../../webViews/loader.webview";
import { getDatasetAndCollection } from "../../webViews/tools/dataImport/getDatasetAndCollection.webview";
import * as fs from "fs";
import { getScopes } from "../../pages/Tools/DataExport/dataExport";
import { getKeysAndAdvancedSettings } from "../../webViews/tools/dataImport/getKeysAndAdvancedSettings.webview";
import { CBImport } from "../../tools/CBImport";

interface IDataImportWebviewState {
  webviewPanel: vscode.WebviewPanel;
}

export class DataImport {
  cachedJsonDocs: string[] = [];
  cachedCsvDocs: Map<string, string[]> = new Map();
  PREVIEW_SIZE: number = 10; // Define your desired preview size
  JSON_FILE_EXTENSION: string = ".json";
  CSV_FILE_EXTENSION: string = ".csv";
  constructor(
    public datasetField: string,
    PREVIEW_SIZE: number = 6
  ) {}

  protected cleanString(input: string): string {
    const firstOpenBracket = input.indexOf("{");
    const lastCloseBracket = input.lastIndexOf("}");

    if (
      firstOpenBracket === -1 ||
      lastCloseBracket === -1 ||
      firstOpenBracket > lastCloseBracket
    ) {
      return input;
    }

    return input.substring(firstOpenBracket, lastCloseBracket + 1);
  }

  protected isValidBrackets(s: string): boolean {
    const stack: string[] = [];

    if (!s.includes("{") || !s.includes("}")) {
      return false;
    }

    for (const c of s) {
      if (c === "{") {
        stack.push(c);
      } else if (c === "}" && (stack.length === 0 || stack.pop() !== "{")) {
        return false;
      }
    }

    return stack.length === 0;
  }

  private readAndProcessPartialDataFromDataset = () => {
    try {
      const datasetPath: string = this.datasetField;

      if (datasetPath.endsWith(this.JSON_FILE_EXTENSION)) {
        const readStream = fs.createReadStream(datasetPath, {
          encoding: "utf8",
        });
        let counter = 0;
        let documentFound = "";
        let insideArray = false;

        readStream.on("data", (chunk: string) => {
          const lines = chunk.split("\n");

          for (let line of lines) {
            if (counter === 0 && !insideArray) {
              if (!line.trim().startsWith("[")) {
                logger.debug("Not a JSON array");
                // TODO: Give error to user as well
                readStream.close();
                return;
              }

              insideArray = true;
              line = line.replace("[", "");
            }

            if (
              counter > 2000 ||
              this.cachedJsonDocs.length >= this.PREVIEW_SIZE
            ) {
              readStream.close();
              return;
            }

            counter++;
            documentFound += line.trim();

            if (this.isValidBrackets(documentFound)) {
              documentFound = this.cleanString(documentFound);
              this.cachedJsonDocs.push(documentFound);
              documentFound = "";
            }
          }
        });

        readStream.on("end", () => {
            readStream.close();
        });
      }
    } catch (err) {}
  };

  validateFormData = (formData: any): string => {
    let errors = [];

    // Check if dataset and bucket are not empty
    if (!formData.dataset) {
        errors.push('Dataset is required.');
    }
    if (!formData.bucket) {
        errors.push('Bucket is required.');
    }

    // Perform different validation checks based on the value of scopesAndCollections
    switch (formData.scopesAndCollections) {
        case 'SpecifiedCollection':
            // Check if scopesDropdown and collectionsDropdown are not empty
            if (!formData.scopesDropdown || formData.scopesDropdown === "") {
                errors.push('Scope is required for Specified Collection.');
            }
            if (!formData.collectionsDropdown || formData.collectionsDropdown === "") {
                errors.push('Collection is required for Specified Collection.');
            }
            break;
        case 'dynamicCollection':
            // Check if scopesDynamicField and collectionsDynamicField are not empty
            if (!formData.scopesDynamicField || formData.scopesDynamicField.trim() === "") {
                errors.push('Scope Field is required for Dynamic Collection.');
            }
            if (!formData.collectionsDynamicField || formData.collectionsDynamicField.trim() === "") {
                errors.push('Collection Field is required for Dynamic Collection.');
            }
            // TODO: Add advanced check for dynamic fields
            break;
        default:
            // No additional validation needed for 'defaultCollection'
            break;
    }
    // Return the array of error messages
    if (errors.length > 0) {
      return errors.join("<br>");
    }
  
    return "";
  };


  public dataImport = async () => {
    const connection = getActiveConnection();
    if (!connection) {
      return;
    }
    if (!CBTools.getTool(CBToolsType.CB_IMPORT).isAvailable()) {
      vscode.window.showErrorMessage(
        "CB Import is still loading, Please try again later"
      );
      return;
    }

    const dataImportWebviewDetails = Memory.state.get<IDataImportWebviewState>(
      Constants.DATA_IMPORT_WEBVIEW
    );
    if (dataImportWebviewDetails) {
      // data import webview already exists, Closing existing and creating new
      try {
        dataImportWebviewDetails.webviewPanel.dispose();
      } catch (e) {
        logger.error("Error while disposing data import webview: " + e);
      }
      Memory.state.update(Constants.DATA_IMPORT_WEBVIEW, null);
    }

    const currentPanel = vscode.window.createWebviewPanel(
      "dataImport",
      "Data Import",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        enableForms: true,
      }
    );
    Memory.state.update(Constants.DATA_IMPORT_WEBVIEW, {
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
    currentPanel.webview.html = getLoader("Data Import");

    // Get all buckets
    const buckets = await connection.cluster?.buckets().getAllBuckets();
    if (buckets === undefined) {
      vscode.window.showErrorMessage("Buckets not found");
      return;
    }
    const bucketNameArr: string[] = [];
    for (let bucket of buckets) {
      bucketNameArr.push(bucket.name);
    }

    try {
      currentPanel.webview.html = await getDatasetAndCollection(bucketNameArr, undefined);
      currentPanel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
          // ADD cases here :)
          case 'vscode-couchbase.tools.dataImport.runImport':
            const runFormData = message.data;
            const runValidationError = this.validateFormData(runFormData);
            if (runValidationError === "") {
              CBImport.import({
                bucket: runFormData.bucket, // TODO: bucket should be taken from other form
                dataset: runFormData.dataset,
                fileFormat: runFormData.fileFormat,
                scopeCollectionExpression: runFormData.scopeCollectionExpression,
                generateKeyExpression: runFormData.generateKeyExpression,
                skipDocsOrRows: runFormData.skipDocsOrRows,
                limitDocsOrRows: runFormData.limitDocsOrRows,
                ignoreFields: runFormData.ignoreFields,
                threads: runFormData.threads,
                verbose: runFormData.verbose
              });
            }

            break;
          case 'vscode-couchbase.tools.dataImport.nextGetDatasetAndCollectionPage':
            const formData = message.data;
            const validationError = this.validateFormData(formData);
            if (validationError === "") {
              // NO Validation Error on Page 1, We can shift to next page
              currentPanel.webview.html = getLoader("Data Import");
              currentPanel.webview.html = getKeysAndAdvancedSettings(formData);

            } else {
              currentPanel.webview.postMessage({
                command: "vscode-couchbase.tools.dataImport.getDatasetAndCollectionPageFormValidationError",
                error: validationError,
              });
            }
            break;
          case "vscode-couchbase.tools.dataImport.getScopes":
            const scopes = await getScopes(message.bucketId, connection);
            if (scopes === undefined) {
              vscode.window.showErrorMessage("Scopes are undefined");
              break;
            }

            currentPanel.webview.postMessage({
              command: "vscode-couchbase.tools.dataImport.scopesInfo",
              scopes: scopes,
            });
            break;
          case "vscode-couchbase.tools.dataImport.getDatasetFile":
            const options: vscode.OpenDialogOptions = {
              canSelectMany: false,
              openLabel: "Choose Dataset File",
              canSelectFiles: true,
              canSelectFolders: false,
            };

            vscode.window.showOpenDialog(options).then((fileUri) => {
              if (fileUri && fileUri[0]) {
                currentPanel.webview.postMessage({
                  command: "vscode-couchbase.tools.dataImport.datasetFile",
                  dataset: fileUri[0].fsPath,
                });
              }
            });
            break;
          case 'vscode-couchbase.tools.dataImport.getKeysBack':
            const datasetAndTargetData = message.datasetAndTargetData;
            const keysAndAdvancedSettingsData = message.keysAndAdvancedSettingsData;
            currentPanel.webview.html = getLoader("Data Import");
            currentPanel.webview.html = await getDatasetAndCollection(bucketNameArr, datasetAndTargetData);
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
}
