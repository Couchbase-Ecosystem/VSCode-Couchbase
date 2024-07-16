import { Node } from 'jsonc-parser'
import { CBSContributor } from './autoComplete'
import * as vscode from 'vscode';
import { cbsTemplate } from './cbsTemplates';

export class knnCbsContributor implements CBSContributor {
    public static keys: string[] = ["k", "field", "vector", "boost"];

    accept(key: string | null): boolean {
        return key === "knn";
    }

    contributeKey(parentKey: string, node: Node, suggestion: string[], result: vscode.CompletionItem[], existingKeys: string[] ) {
        suggestion.push(...knnCbsContributor.keys)
        result.push(cbsTemplate.getVectorTemplate(existingKeys))

    }

    contributeValue(attributeKey: string, node: Node, suggestion: string[], fields:string[]) {
        if (attributeKey == "field") {
            suggestion.push(...fields);
        }

    }

}