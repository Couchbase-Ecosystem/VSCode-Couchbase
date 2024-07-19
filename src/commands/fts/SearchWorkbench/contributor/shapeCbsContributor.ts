import { Node } from "jsonc-parser";
import { CompletionItem } from "vscode";
import { CBSContributor } from "./autoComplete";

export class shapeCbsContributor implements CBSContributor {
    accept(key: string | null): boolean {
        return key === "shape";
    }

    contributeKey(
        parentKey: string | null,
        node: Node,
        suggestion: string[],
        result: CompletionItem[],
        existingKeys: string[],
    ) {
        let type: string = "";
        if (node.type === "string") {
            if (node.parent && node.parent.parent) {
                node = node.parent.parent;
            }
        }
        if (!node.children) {
            return;
        }
        for (const propertyNode of node.children) {
            if (propertyNode.type === "property" && propertyNode.children) {
                let keyNode = null;
                let valueNode = null;

                for (const childNode of propertyNode.children) {
                    if (
                        childNode.type === "string" &&
                        childNode.value === "type"
                    ) {
                        keyNode = childNode;
                    } else if (childNode.type === "string") {
                        valueNode = childNode;
                    }

                    if (keyNode && valueNode) {
                        type = valueNode.value;
                    }
                }
            }
        }

        if (type === "Circle") {
            suggestion.push("coordinates");
            suggestion.push("type");
            suggestion.push("radius");
        } else if (type === "GeometryCollection") {
            suggestion.push("type");
            suggestion.push("geometries");
        } else if (type === "") {
            suggestion.push("coordinates");
            suggestion.push("type");
            suggestion.push("radius");
            suggestion.push("geometries");
        } else {
            suggestion.push("coordinates");
            suggestion.push("type");
        }
    }

    contributeValue(
        attributeKey: string | null,
        node: Node,
        suggestion: string[],
        fields: string[],
    ) {
        if (attributeKey === "type") {
            suggestion.push("Point");
            suggestion.push("LineString");
            suggestion.push("Polygon");
            suggestion.push("MultiPoint");
            suggestion.push("MultiLineString");
            suggestion.push("MultiPolygon");
            suggestion.push("GeometryCollection");
            suggestion.push("Circle");
            suggestion.push("Envelope");
        }
    }
}
