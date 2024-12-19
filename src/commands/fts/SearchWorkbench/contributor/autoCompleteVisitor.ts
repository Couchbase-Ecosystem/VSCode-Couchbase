import * as vscode from "vscode";
import * as jsonc from "jsonc-parser";
import { CBSContributor } from "./autoComplete";
import { booleanCbsContributor } from "./booleanCbsContributor";
import { consistencyCbsContributor } from "./consistencyCbsContributor";
import { geometryCbsContributor } from "./geometryCbsContributor";
import { highlightCbsContributor } from "./highlightCbsContributor";
import { knnCbsContributor } from "./knnCbsContributor";
import { locationCbsContributor } from "./locationCbsContributor";
import { fieldsContributor } from "./fieldsContributor";
import { queryCbsContributor } from "./queryCbsContributor";
import { cbsTemplate } from "./cbsTemplates";
import { ctlCbsContributor } from "./ctlCbsContributor";
import { shapeCbsContributor } from "./shapeCbsContributor";
import { SearchWorkbench } from "../searchWorkbench";
import { logger } from "../../../../logger/logger";
import { CacheService } from "../../../../util/cacheService/cacheService";

export class AutocompleteVisitor {
    public topLevelKeywords: string[] = [
        "query",
        "knn",
        "ctl",
        "size",
        "limit",
        "from",
        "offset",
        "highlight",
        "fields",
        "facets",
        "explain",
        "sort",
        "includeLocations",
        "score",
        "search_after",
        "search_before",
        "collections",
    ];
    private contributors: CBSContributor[] = [
        new booleanCbsContributor(),
        new consistencyCbsContributor(),
        new geometryCbsContributor(),
        new highlightCbsContributor(),
        new knnCbsContributor(),
        new locationCbsContributor(),
        new queryCbsContributor(),
        new ctlCbsContributor(),
        new shapeCbsContributor(),
    ];

    async getAutoCompleteContributor(
        document: vscode.TextDocument,
        position: vscode.Position,
        searchWorkBench?: SearchWorkbench,
        cache?:CacheService
    ): Promise<vscode.CompletionItem[]> {
        const text = document.getText();
        // const rootNode = jsonc.parseTree(text);
        const queryContext = searchWorkBench?.editorToContext.get(
            document.uri.toString(),
        );
        const tempJsonString = this.addTemporaryQuotes(text, position);
        const rootNode = jsonc.parseTree(tempJsonString);

        if (!rootNode) {
            return [];
        }
        const node = jsonc.findNodeAtOffset(
            rootNode,
            document.offsetAt(position),
        );

        if (!node) {
            return [];
        }
        if (!this.isWithinObject(node)) {
            return [];
        }
        const isKey = this.isKey(document, position);
        let attributeName: string | null = null;
        if (!isKey) {
            attributeName = this.getAttributeName(rootNode, node);
        }

        const suggestions: string[] = [];
        const result: vscode.CompletionItem[] = [];
        const existingKeys: string[] = [];

        await this.fetchKeys(node, existingKeys);
        const isWithinQuotes = this.isWithinQuotes(document, position);
        if (this.isTopLevelProperty(rootNode, node)) {
            if (!isKey) {
                if (attributeName == "score") {
                    suggestions.push("none");
                }
            } else {
                suggestions.push(
                    ...this.topLevelKeywords.filter(
                        (keyword) => !existingKeys.includes(keyword),
                    ),
                );

                if (!existingKeys.includes("highlight")) {
                    result.push(cbsTemplate.getHighlightTemplate());
                }
                if (!existingKeys.includes("knn")) {
                    result.push(cbsTemplate.getKNNTemplate());
                }
            }
        } else {
            let type = this.getNodeType(node, rootNode);
            for (const contributor of this.contributors) {
                if (contributor.accept(type)) {
                    if (isKey) {
                        const existingKeys2 = existingKeys.filter(
                            (item) => item !== "<caret>",
                        );
                        contributor.contributeKey(
                            type,
                            node,
                            suggestions,
                            result,
                            existingKeys2,
                        );
                    } else {
                        let fields: string[] = [];
                        if (
                            attributeName == "field" &&
                            queryContext?.bucketName &&
                            queryContext?.indexName &&
                            cache
                        ) {
                            fields = await fieldsContributor.getFieldNames(
                                queryContext?.bucketName,
                                queryContext?.indexName,
                                cache
                            );
                        }
                        contributor.contributeValue(
                            attributeName,
                            node,
                            suggestions,
                            fields,
                        );
                    }
                }
            }
        }
        for (const suggestion of suggestions) {
            if (!existingKeys.includes(suggestion)) {
                let itemLabel = suggestion;
                if (!isWithinQuotes) {
                    itemLabel = `"${suggestion}"`;
                }

                const completionItem = new vscode.CompletionItem(
                    itemLabel,
                    vscode.CompletionItemKind.Text,
                );
                result.push(completionItem);
            }
        }
        return result;
    }

    addTemporaryQuotes(jsonString: string, position: vscode.Position): string {
        const lines = jsonString.split("\n");
        const line = lines[position.line];

        const regex = /("(\w+)")\s*:\s*,/;

        if (regex.test(line)) {
            return lines
                .map((l, i) =>
                    i === position.line ? l.replace(regex, '$1: "",') : l,
                )
                .join("\n");
        }

        return jsonString;
    }

    isTopLevelProperty(rootNode: jsonc.Node, currentNode: jsonc.Node) {
        if (currentNode === rootNode) {
            return true;
        }
        if (currentNode.type === "string") {
            if (currentNode.parent && currentNode.parent.parent) {
                const propertyNode = currentNode.parent.parent;
                return propertyNode === rootNode;
            }
        }
        if (currentNode.type === "property" && currentNode.parent) {
            return currentNode.parent === rootNode;
        }

        return false;
    }

    async fetchKeys(node: jsonc.Node, existingKeys: string[]): Promise<void> {
        if (node.type === "object") {
            for (const prop of node.children || []) {
                if (prop.type === "property") {
                    const keyNode = prop.children?.[0];
                    if (keyNode && keyNode.type === "string") {
                        existingKeys.push(keyNode.value as string);
                    }
                }
            }
        } else if (node.type === "string") {
            if (
                node.parent?.type === "property" &&
                node.parent.parent?.type === "object"
            ) {
                const objectNode = node.parent.parent;
                for (const prop of objectNode.children || []) {
                    if (prop.type === "property") {
                        const keyNode = prop.children?.[0];
                        if (
                            keyNode &&
                            keyNode.type === "string" &&
                            keyNode.value !== ""
                        ) {
                            existingKeys.push(keyNode.value as string);
                        }
                    }
                }
            }
        }
    }

    getNodeType(
        node: jsonc.Node | undefined,
        rootNode: jsonc.Node,
    ): string | null {
        let currentNode = node;
        if (!currentNode) {
            logger.debug("Error fetching Node type, Node is undefined");
            return null;
        }

        let lastPropertyName = undefined;
        let count = 0;

        while (currentNode) {
            if (currentNode.type === "property") {
                if (currentNode.parent) {
                    count = count + 1;
                    lastPropertyName = jsonc.findNodeAtOffset(
                        rootNode,
                        currentNode.offset,
                    )?.value;
                    if (count == 2) {
                        break;
                    }
                }
            } else if (
                currentNode.type === "array" &&
                currentNode.parent &&
                currentNode.parent.type === "property"
            ) {
                lastPropertyName = jsonc.findNodeAtOffset(
                    rootNode,
                    currentNode.parent.offset,
                )?.value;
                break;
            } else if (
                currentNode.type === "object" &&
                currentNode.parent &&
                currentNode.parent.type === "property"
            ) {
                lastPropertyName = jsonc.findNodeAtOffset(
                    rootNode,
                    currentNode.parent.offset,
                )?.value;
                break;
            }
            currentNode = currentNode.parent;
        }

        if (lastPropertyName) {
            return lastPropertyName;
        } else {
            return null;
        }
    }

    isKey(document: vscode.TextDocument, position: vscode.Position): boolean {
        const lineText = document
            .lineAt(position.line)
            .text.substring(0, position.character);

        if (/^\s*[\{,]\s*$/.test(lineText)) {
            return true;
        }

        let depth = 0;
        for (let i = position.character - 1; i >= 0; i--) {
            const char = lineText[i];
            switch (char) {
                case ":":
                    if (depth === 0) return false;
                    break;
                case "{":
                case "[":
                    depth++;
                    break;
                case "}":
                case "]":
                    depth--;
                    break;
            }
        }

        return true;
    }

    getAttributeName(rootNode: jsonc.Node, currentNode: jsonc.Node) {
        if (!rootNode) {
            return null;
        }
        if (currentNode && currentNode.parent?.type === "object") {
            return jsonc.findNodeAtOffset(rootNode, currentNode.offset)?.value;
        }
        if (
            currentNode &&
            currentNode.parent &&
            currentNode.parent?.type === "property"
        ) {
            const propertyNode = currentNode.parent;
            return jsonc.findNodeAtOffset(rootNode, propertyNode.offset)?.value;
        }

        return null;
    }

    isWithinQuotes(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): boolean {
        const lineText = document.lineAt(position.line).text;
        const charPos = position.character;

        let quoteOpen = false;
        let quoteClose = false;

        for (let i = charPos - 1; i >= 0; i--) {
            if (lineText[i] === '"' && (i === 0 || lineText[i - 1] !== "\\")) {
                quoteOpen = true;
                break;
            }
        }

        for (let i = charPos; i < lineText.length; i++) {
            if (lineText[i] === '"' && (i === 0 || lineText[i - 1] !== "\\")) {
                quoteClose = true;
                break;
            }
        }

        return quoteOpen && quoteClose;
    }

    isWithinObject(currentNode: jsonc.Node): boolean {
        while (currentNode) {
            if (currentNode.type === "array") {
                let objectWithinArray: jsonc.Node | undefined = currentNode;
                while (
                    objectWithinArray &&
                    objectWithinArray.type !== "object"
                ) {
                    objectWithinArray = objectWithinArray.parent;
                }
                return (
                    objectWithinArray !== undefined &&
                    objectWithinArray.parent === currentNode
                );
            } else if (currentNode.type === "object") {
                return true;
            }
            if (currentNode.parent) {
                currentNode = currentNode.parent;
            }
        }

        return true;
    }
}
