import * as jsonc from "jsonc-parser";
import * as vscode from "vscode";

export interface CBSContributor {
    accept(key: string | null): boolean;

    contributeKey(
        parentKey: string | null,
        node: jsonc.Node,
        suggestion: string[],
        result: vscode.CompletionItem[],
        existingKeys: string[],
    ): any;

    contributeValue(
        attributeKey: string | null,
        node: jsonc.Node,
        suggestion: string[],
        fields: string[],
    ): any;
}
