import * as vscode from "vscode";
import { JsonObject } from "./JsonNodes";

export interface SearchObjectValidator {
    accept(key: string | null): boolean;
    validate(
        jsonObject: JsonObject,
        diagnosticsList: vscode.Diagnostic[],
        document: vscode.TextDocument,
        key: string | null,
    ): void;
}
