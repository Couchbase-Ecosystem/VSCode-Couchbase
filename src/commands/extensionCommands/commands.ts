/*
 *     Copyright 2011-2020 Couchbase, Inc.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
export namespace Commands {
    export const createClusterConnection: string = "vscode-couchbase.createClusterConnection";
    export const deleteClusterConnection: string = "vscode-couchbase.deleteClusterConnection";
    export const refreshConnection: string = "vscode-couchbase.refreshConnection";
    export const useClusterConnection: string = "vscode-couchbase.useClusterConnection";
    export const disconnectClusterConnection: string = "vscode-couchbase.disconnectClusterConnection";
    export const createCollection: string = "vscode-couchbase.createCollection";
    export const refreshCollection: string = "vscode-couchbase.refreshCollection";
    export const removeCollection: string = "vscode-couchbase.removeCollection";
    export const createScope: string = "vscode-couchbase.createScope";
    export const removeScope: string = "vscode-couchbase.removeScope";
    export const refreshScopes: string = "vscode-couchbase.refreshScopes";
    export const refreshCollections: string = "vscode-couchbase.refreshCollections";
    export const getBucketMetaData: string = "vscode-couchbase.getBucketInfo";
    export const createDocument: string = "vscode-couchbase.createDocument";
    export const openDocument: string = "vscode-couchbase.openDocument";
    export const openSearchIndex: string = "vscode-couchbase.openSearchIndex";
    export const removeDocument: string = "vscode-couchbase.removeDocument";
    export const getDocumentMetaData: string = "vscode-couchbase.getDocumentMetaData";
    export const searchDocument: string = "vscode-couchbase.searchDocument";
    export const openIndexInfo: string = "vscode-couchbase.openIndexInfo";
    export const refreshIndexes: string = "vscode-couchbase.refreshIndexes";
    export const openQueryNotebook: string = "vscode-couchbase.openQueryNotebook";
    export const openQueryWorkbench: string = "vscode-couchbase.openQueryWorkbench";
    export const openSearchWorkbench: string = "vscode-couchbase.openSearchWorkbench";
    export const deleteSearchIndex: string = "vscode-couchbase.deleteSearchIndex";
    export const getSampleProjects: string = "vscode-couchbase.openSampleProjects";
    export const loadMore: string = "vscode-couchbase.loadMore";
    export const showOutputConsole: string = "vscode-couchbase.showOutputConsole";
    export const runQuery: string = "vscode-couchbase.runQuery";
    export const explainQuery: string = "vscode-couchbase.explainQuery";
    export const runSearchQuery: string = "vscode-couchbase.runSearch";
    export const queryWorkbench: string = "vscode-couchbase.couchbase-query-workbench";
    export const searchWorkbench: string = "vscode-couchbase.couchbase-search-workbench";
    export const getClusterOverview: string = "vscode-couchbase.getClusterOverview";
    export const queryContext: string = "vscode-couchbase.queryContext";
    export const searchContext: string = "vscode-couchbase.searchContext";
    export const showFavoriteQueries: string = "vscode-couchbase.showFavoriteQueries";
    export const markFavoriteQuery: string = "vscode-couchbase.markFavoriteQuery";
    export const showNamedParameters: string = "vscode-couchbase.showNamedParameters";
    export const refreshNamedParameters: string = "vscode-couchbase.refreshNamedParameters";
    export const applyQueryHistory: string = "vscode-couchbase.applyQueryHistory";
    export const deleteQueryHistoryItem: string = "vscode-couchbase.deleteQueryHistoryItem";
    export const copyQueryHistoryItem: string = "vscode-couchbase.copyQueryHistoryItem";
    export const refreshQueryHistory: string = "vscode-couchbase.refreshQueryHistory";
    export const queryTypeDocumentFilter: string = "vscode-couchbase.queryTypeDocumentFilter";
    export const kvTypeDocumentFilter: string = "vscode-couchbase.kvTypeDocumentFilter";
    export const editQueryTypeDocumentFilter: string = "vscode-couchbase.editQueryTypeDocumentFilter";
    export const editKvTypeDocumentFilter: string = "vscode-couchbase.editKvTypeDocumentFilter";
    export const clearDocumentFilter: string = "vscode-couchbase.clearDocumentFilter";
    export const refreshClusterOverview: string = "vscode-couchbase.refreshClusterOverview";
    export const refreshCache: string = "vscode-couchbase.refreshCache";
    export const checkAndCreatePrimaryIndex: string = "vscode-couchbase.checkAndCreatePrimaryIndex";
    export const dataExport: string = "vscode-couchbase.tools.dataExport";
    export const mdbMigrate: string = "vscode-couchbase.tools.mdbMigrate";
    export const dynamodbMigrate: string = "vscode-couchbase.tools.dynamodbMigrate";
    export const huggingFaceMigrate: string = "vscode-couchbase.tools.huggingFaceMigrate";
    export const dataImport: string = "vscode-couchbase.tools.dataImport";
    export const ddlExport: string = "vscode-couchbase.tools.DDLExport";
    export const couchbaseIqViewsCommand: string = "couchbase-iq";
    export const couchbaseAssistantViewsCommand: string = "couchbase-assistant";
    export const logoutIq: string = "vscode-couchbase.iq.logout";
    export const showIqSettings: string = "vscode-couchbase.iq.showSettings";
    export const showAssistantSettings: string = "vscode-couchbase.assistant.showSettings";
    export const showWorkbenchSettings: string = "vscode-couchbase.workbench.showSettings";
    export const showChatInterfaceSettings: string = "vscode-couchbase.settings.showChatInterface";
    export const newIqChat: string = "vscode-couchbase.iq.newChat";
    export const setQueryTimeout: string = "vscode-couchbase.workbench.setQueryTimeout";
}
