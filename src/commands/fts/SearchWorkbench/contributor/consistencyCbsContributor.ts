import { Node } from "jsonc-parser";
import { CBSContributor } from "./autoComplete";
import * as vscode from "vscode";

export class consistencyCbsContributor implements CBSContributor {
    public static keys: string[] = ["vectors", "level", "results"];

    accept(key: string | null): boolean {
        return key === "consistency";
    }

    contributeKey(
        parentKey: string,
        node: Node,
        suggestion: string[],
        result: vscode.CompletionItem[],
        existingKeys: string[],
    ) {
        suggestion.push(...consistencyCbsContributor.keys);
    }

    contributeValue(
        attributeKey: string,
        node: Node,
        suggestion: string[],
        fields: string[],
    ) {
        if (attributeKey == "level") {
            suggestion.push("at_plus", "not_bounded");
        } else if (attributeKey == "results") {
            suggestion.push("complete");
        }
    }
}
