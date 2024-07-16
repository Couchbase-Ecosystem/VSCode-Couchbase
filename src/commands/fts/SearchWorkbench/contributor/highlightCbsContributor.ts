import { Node } from 'jsonc-parser'
import { CBSContributor } from './autoComplete'
import * as vscode from 'vscode';

export class highlightCbsContributor implements CBSContributor {
    public static keys: string[] = ["style", "fields"];

    accept(key: string | null): boolean {
        return key === "highlight";
    }

    contributeKey(parentKey: string, node: Node, suggestion: string[], result: vscode.CompletionItem[], existingKeys: string[]) {
        suggestion.push(...highlightCbsContributor.keys)

    }

    contributeValue(attributeKey: string, node: Node, suggestion: string[]) {
        if (attributeKey == "style") {
            suggestion.push("ansi", "html")
        }

    }

}