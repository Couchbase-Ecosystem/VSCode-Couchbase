import * as vscode from "vscode";
import { SearchWorkbench } from "../commands/fts/SearchWorkbench/searchWorkbench";
import { showSearchContextStatusbar } from "../util/queryContextUtils";
import SearchIndexNode from "../model/SearchIndexNode";

export const handleSearchContextStatusbar = async (
    editor: vscode.TextEditor | undefined,
    searchNode: SearchIndexNode,
    workbench: SearchWorkbench,
    globalStatusBarItem: vscode.StatusBarItem,
) => {
    if (
        editor &&
        editor.document.languageId === "json" &&
        editor.document.fileName.endsWith(".cbs.json")
    ) {
        // Case 1: Show Status bar
        showSearchContextStatusbar(
            editor,
            searchNode,
            workbench,
            globalStatusBarItem,
        );
    } else {
        // Case 2: Don't show status bar
        globalStatusBarItem.hide();
    }
};
