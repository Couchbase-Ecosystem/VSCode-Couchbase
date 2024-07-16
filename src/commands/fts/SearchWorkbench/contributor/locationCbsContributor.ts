import { Node } from 'jsonc-parser'
import { CBSContributor } from './autoComplete'
import * as vscode from 'vscode';

export class locationCbsContributor implements CBSContributor {
    public static keys: string[] = ["lat", "lon"];

    accept(key: string | null): boolean {
        return key === "location" || key === "top_left" || key === "bottom_right";
    }

    contributeKey(parentKey: string, node: Node, suggestion: string[], result: vscode.CompletionItem[], existingKeys: string[]) {
        suggestion.push(...locationCbsContributor.keys)

    }

    contributeValue(attributeKey: string, node: Node, suggestion: string[], fields: string[]) {

    }

}