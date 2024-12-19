import { Node } from "jsonc-parser";
import { CBSContributor } from "./autoComplete";
import * as vscode from "vscode";

export class ctlCbsContributor implements CBSContributor {
    public static keys: string[] = ["timeout", "consistency"];

    accept(key: string | null): boolean {
        return key === "ctl";
    }

    contributeKey(
        parentKey: string,
        node: Node,
        suggestion: string[],
        result: vscode.CompletionItem[],
        existingKeys: string[],
    ) {
        suggestion.push(...ctlCbsContributor.keys);
    }

    contributeValue(
        attributeKey: string,
        node: Node,
        suggestion: string[],
        fields: string[],
    ) {}
}
