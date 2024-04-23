import { MDBToCB } from "../../../tools/MDBMigrate";
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
import { MdbMigrateWebview } from "../../../webViews/tools/mdbMigrate.webview";
import { IConnection } from "../../../types/IConnection";
import { MongoClient } from "mongodb";

export const getScopes = async (bucketId: string, connection: IConnection) => {
  const scopes = await connection.cluster
    ?.bucket(bucketId)
    .collections()
    .getAllScopes();
  return scopes;
};

const validateFormData = (formData: any): string => {
  const errors = [];
  if (!formData.connectionString.trim()) {
    errors.push("Please specify a valid Mongodb Connection URI");
  }

  if (!formData.database) {
    errors.push("Please specify the Source Database to migrate from");
  }

  if (!formData.collections || formData.collections.length === 0) {
    errors.push("Please specify the Source Collections field");
  }

  if (!formData.bucket) {
    errors.push("Please select a Couchbase bucket");
  }

  if (!formData.cbScope || formData.cbScope.length === 0) {
    errors.push("Please select a Couchbase scope field");
  }

  if (errors.length > 0) {
    return errors.join("<br>");
  }

  return "";
};

export interface IDataMigrateWebviewState {
  webviewPanel: vscode.WebviewPanel;
}

export const mdbMigrate = async (context: vscode.ExtensionContext) => {
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

  const dataMigratetWebviewDetails =
    Memory.state.get<IDataMigrateWebviewState>(
      Constants.DATA_MIGRATE_MDB_WEBVIEW
    );
  if (dataMigratetWebviewDetails) {
    // data migrate webview already exists, Closing existing and creating new
    try {
      dataMigratetWebviewDetails.webviewPanel.dispose();
    } catch (e) {
      logger.error("Error while disposing data migrate webview: " + e);
    }
    Memory.state.update(Constants.DATA_MIGRATE_MDB_WEBVIEW, null);
  }

  const currentPanel = vscode.window.createWebviewPanel(
    "dataMigrate",
    "Data Migration from MDB to Couchbase",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      enableForms: true,
    }
  );
  Memory.state.update(Constants.DATA_MIGRATE_MDB_WEBVIEW, {
    webviewPanel: currentPanel,
  });
  currentPanel.iconPath = {
    dark: vscode.Uri.file(
      path.join(
        __filename,
        "..",
        "..",
        "images",
        "dark",
        "export_dark.svg"
      )
    ),
    light: vscode.Uri.file(
      path.join(
        __filename,
        "..",
        "..",
        "images",
        "light",
        "export_light.svg"
      )
    ),
  };
  currentPanel.webview.html = getLoader("Data Migrate");

  // Get all buckets
  const buckets = await connection.cluster?.buckets().getAllBuckets();
  if (buckets === undefined) {
    vscode.window.showErrorMessage("Buckets not found");
    return;
  }

  const bucketNameArr: string[] = buckets.map((b) => b.name);

  async function connectToMongoDB(
    connectionString: string
  ): Promise<string[]> {
    try {
      const client: MongoClient = await MongoClient.connect(
        connectionString
      );
      logger.info("Connected successfully to MongoDB");
      const adminDb = client.db().admin();
      logger.info("fetching list of databases");
      const databasesList = await adminDb.listDatabases();
      const databases = databasesList.databases.map((db) => db.name);
      await client.close();

      return databases;
    } catch (error) {
      const error_message =
        "Unable to Connect to MongoDB, Please check Connection URI and try again";
      console.error("Error while connecting to MongoDB:", error);
      currentPanel.webview.postMessage({
        command: "vscode-couchbase.tools.mdbMigrate.formValidationError",
        error: error_message,
      });
      throw new Error("Failed to connect to MongoDB: " + error);
    }
  }

  async function getCollectionsList(
    connectionString: string,
    databaseName: string
  ): Promise<string[]> {
    try {
      const client: MongoClient = await MongoClient.connect(
        connectionString
      );
      // Connect to the specific database
      const db = client.db(databaseName);

      // List collections in the specific database
      const collections = await db.listCollections().toArray();
      const collectionNames: string[] = collections.map(
        (collection) => collection.name
      );
      await client.close();

      return collectionNames;
    } catch (error) {
      console.error("Error while fetching collections:", error);
      throw error;
    }
  }

  try {
    currentPanel.webview.html = await MdbMigrateWebview(bucketNameArr);
    currentPanel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        // ADD cases here :)
        case "vscode-couchbase.tools.mdbMigrate.Migrate":
          const formData = message.data;
          const validationError = validateFormData(formData);
          if (validationError === "") {
            // There is no error
            MDBToCB.export(
              formData.connectionString,
              formData.database,
              formData.collections,
              formData.indexes,
              formData.bucket,
              formData.cbScope,
            );
          } else {
            currentPanel.webview.postMessage({
              command:
                "vscode-couchbase.tools.mdbMigrate.formValidationError",
              error: validationError,
            });
          }
          break;
        case "vscode-couchbase.tools.mdbMigrate.getCollections":
          const collection = await getCollectionsList(
            message.connectionString,
            message.databases
          );
          currentPanel.webview.postMessage({
            command:
              "vscode-couchbase.tools.mdbMigrate.collectionInfo",
            collection: collection,
          });

          break;

        case "vscode-couchbase.tools.mdbMigrate.getCbScopes":
          const scopes = await getScopes(
            message.bucketId,
            connection
          );
          if (scopes === undefined) {
            vscode.window.showErrorMessage("Scopes are undefined");
            break;
          }
          currentPanel.webview.postMessage({
            command: "vscode-couchbase.tools.mdbMigrate.scopesInfo",
            scopes: scopes,
          });
          break;

        case "vscode-couchbase.tools.mdbMigrate.getDatabases":
          const databases = await connectToMongoDB(
            message.connectionString
          );
          currentPanel.webview.postMessage({
            command:
              "vscode-couchbase.tools.mdbMigrate.databaseInfo",
            databases: databases,
          });
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
    Memory.state.update(Constants.DATA_MIGRATE_MDB_WEBVIEW, null);
  });
};
