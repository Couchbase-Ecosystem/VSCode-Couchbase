import * as vscode from "vscode";
import * as jsonc from "jsonc-parser";
import * as fs from "fs";
import * as path from "path";
import { logger } from "../../../../logger/logger";

export class CbsJsonHoverProvider implements vscode.HoverProvider {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
    ): vscode.ProviderResult<vscode.Hover> {
        if (!this.isCbsJsonFile(document)) {
            return null;
        }

        const offset = document.offsetAt(position);
        const text = document.getText();
        const rootNode = jsonc.parseTree(text);
        if (!rootNode) {
            return;
        }
        let node = jsonc.findNodeAtOffset(rootNode, offset);
        node = node?.parent;

        if (
            node &&
            node.type === "property" &&
            node.children &&
            node.children[0].type === "string"
        ) {
            const key = node.children[0].value;
            const parentNode = jsonc.findNodeAtOffset(
                rootNode,
                node.parent!.offset,
            );
            const type = this.getParentType(parentNode);

            const documentation = this.getDocumentationForKey(key, type);
            if (documentation) {
                return new vscode.Hover(documentation);
            }
        }

        return null;
    }

    private isCbsJsonFile(document: vscode.TextDocument): boolean {
        return document.fileName.endsWith(".cbs.json");
    }

    private getParentType(node: jsonc.Node | undefined): string | null {
        if (!node || !node.parent) return null;
        if (node.parent.type === "property") {
            return node.parent.children![0].value;
        }
        return null;
    }

    private getDocumentationForKey(
        key: string,
        type: string | null,
    ): vscode.MarkdownString | null {
        let filePath: string;

        switch (key) {
            case "query":
                filePath =
                    type === null
                        ? "/docs/search/query.md"
                        : "/docs/search/query_string.md";
                break;
            case "must":
                filePath = "/docs/search/must.md";
                break;
            case "must_not":
                filePath = "/docs/search/must_not.md";
                break;
            case "should":
                filePath = "/docs/search/should.md";
                break;
            case "conjuncts":
                filePath = "/docs/search/conjuncts.md";
                break;
            case "disjuncts":
                filePath = "/docs/search/disjuncts.md";
                break;
            case "match":
                filePath = "/docs/search/match.md";
                break;
            case "match_phrase":
                filePath = "/docs/search/match_phrase.md";
                break;
            case "bool":
                filePath = "/docs/search/bool.md";
                break;
            case "prefix":
                filePath = "/docs/search/prefix.md";
                break;
            case "regexp":
                filePath = "/docs/search/regexp.md";
                break;
            case "term":
                filePath = "/docs/search/term.md";
                break;
            case "terms":
                filePath = "/docs/search/terms.md";
                break;
            case "wildcard":
                filePath = "/docs/search/wildcard.md";
                break;
            case "min":
                filePath = "/docs/search/min.md";
                break;
            case "max":
                filePath = "/docs/search/max.md";
                break;
            case "inclusive_max":
                filePath = "/docs/search/inclusive_max.md";
                break;
            case "inclusive_min":
                filePath = "/docs/search/inclusive_min.md";
                break;
            case "start":
                filePath = "/docs/search/start.md";
                break;
            case "end":
                filePath = "/docs/search/end.md";
                break;
            case "inclusive_start":
                filePath = "/docs/search/inclusive_start.md";
                break;
            case "inclusive_end":
                filePath = "/docs/search/inclusive_end.md";
                break;
            case "cidr":
                filePath = "/docs/search/cidr.md";
                break;
            case "knn":
                filePath = "/docs/search/knn.md";
                break;
            case "k":
                filePath = "/docs/search/k.md";
                break;
            case "vector":
                filePath = "/docs/search/vector.md";
                break;
            case "distance":
                filePath = "/docs/search/distance.md";
                break;
            case "location":
                filePath = "/docs/search/location.md";
                break;
            case "lat":
                filePath = "/docs/search/lat.md";
                break;
            case "lon":
                filePath = "/docs/search/lon.md";
                break;
            case "top_left":
                filePath = "/docs/search/top_left.md";
                break;
            case "bottom_right":
                filePath = "/docs/search/bottom_right.md";
                break;
            case "polygon_points":
                filePath = "/docs/search/polygon_points.md";
                break;
            case "geometry":
                filePath = "/docs/search/geometry.md";
                break;
            case "shape":
                filePath = "/docs/search/shape.md";
                break;
            case "type":
                filePath =
                    type === "shape"
                        ? "/docs/search/type_shape.md"
                        : "/docs/search/type_facet.md";
                break;
            case "coordinates":
                filePath = "/docs/search/coordinates.md";
                break;
            case "relation":
                filePath = "/docs/search/relation.md";
                break;
            case "geometries":
                filePath = "/docs/search/geometries.md";
                break;
            case "radius":
                filePath = "/docs/search/radius.md";
                break;
            case "match_all":
                filePath = "/docs/search/match_all.md";
                break;
            case "match_none":
                filePath = "/docs/search/match_none.md";
                break;
            case "analyzer":
                filePath = "/docs/search/analyzer.md";
                break;
            case "boost":
                filePath = "/docs/search/boost.md";
                break;
            case "field":
                filePath = "/docs/search/field.md";
                break;
            case "fuzziness":
                filePath = "/docs/search/fuzziness.md";
                break;
            case "operator":
                filePath = "/docs/search/operator.md";
                break;
            case "prefix_length":
                filePath = "/docs/search/prefix_length.md";
                break;
            case "size":
            case "limit":
                filePath = "/docs/search/limit.md";
                break;
            case "from":
            case "offset":
                filePath = "/docs/search/offset.md";
                break;
            case "fields":
                filePath = "/docs/search/fields.md";
                break;
            case "facets":
                filePath = "/docs/search/facets.md";
                break;
            case "explain":
                filePath = "/docs/search/explain.md";
                break;
            case "sort":
                filePath = "/docs/search/sort.md";
                break;
            case "includeLocations":
                filePath = "/docs/search/includeLocations.md";
                break;
            case "score":
                filePath = "/docs/search/score.md";
                break;
            case "search_after":
                filePath = "/docs/search/search_after.md";
                break;
            case "search_before":
                filePath = "/docs/search/search_before.md";
                break;
            case "collections":
                filePath = "/docs/search/collections.md";
                break;
            case "ctl":
                filePath = "/docs/search/ctl.md";
                break;
            case "timeout":
                filePath = "/docs/search/timeout.md";
                break;
            case "consistency":
                filePath = "/docs/search/consistency.md";
                break;
            case "vectors":
                filePath = "/docs/search/vectors.md";
                break;
            case "level":
                filePath = "/docs/search/level.md";
                break;
            case "results":
                filePath = "/docs/search/results.md";
                break;
            case "highlight":
                filePath = "/docs/search/highlight.md";
                break;
            case "style":
                filePath = "/docs/search/style.md";
                break;
            default:
                return new vscode.MarkdownString(
                    "No documentation available for this key.",
                );
        }
        try {
            const fullPath = path.join(this.context.extensionPath, filePath);
            const content = fs.readFileSync(fullPath, "utf8");
            return new vscode.MarkdownString(content);
        } catch (error) {
            logger.error(`Error reading documentation file: ${error}`);
            // Return empty for no documentation
            return new vscode.MarkdownString("");
        }
    }
}
