import { Node } from 'jsonc-parser'
import { CBSContributor } from './autoComplete'
import * as vscode from 'vscode';

export class geometryCbsContributor implements CBSContributor {
    public static keys: string[] = ["shape", "relation"];

    accept(key: string | null): boolean {
        return key === "geometry";
    }

    contributeKey(parentKey: string, node: Node, suggestion: string[], result: vscode.CompletionItem[], existingKeys: string[]) {
        suggestion.push(...geometryCbsContributor.keys)

    }

    contributeValue(attributeKey: string, node: Node, suggestion: string[], fields:string[]) {
        if (attributeKey == "relation") {
            suggestion.push("intersects", "contains", "within")
        }

    }

}