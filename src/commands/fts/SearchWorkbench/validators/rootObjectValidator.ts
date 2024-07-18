import * as vscode from "vscode";
import { SearchObjectValidator } from "./searchValidator";
import { JsonObject, JsonProperty } from "./JsonNodes";
import { ValidationHelper } from "./validationHelper";

export class RootObjectValidator implements SearchObjectValidator {
    private readonly validRootKeys: Set<string> = new Set([
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
    ]);

    accept(key: string | null): boolean {
        return key === null;
    }

    validate(
        jsonObject: JsonObject,
        diagnosticsList: vscode.Diagnostic[],
        document: vscode.TextDocument,
    ): void {
        if (!jsonObject || !jsonObject.children) {
            const emptyError = new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 1),
                "Your search query can't be empty",
                vscode.DiagnosticSeverity.Error,
            );
            if (
                !ValidationHelper.diagnosticExists(diagnosticsList, emptyError)
            ) {
                diagnosticsList.push(emptyError);
            }
            return;
        }

        const counter: Map<string, number> = new Map();
        const positionMap = ValidationHelper.getPositionMap(document);

        jsonObject.children.forEach((child) => {
            if (
                child instanceof JsonProperty &&
                this.validRootKeys.has(child.key)
            ) {
                counter.set(child.key, (counter.get(child.key) || 0) + 1);
            } else if (child instanceof JsonProperty) {
                const newDiagnostic = new vscode.Diagnostic(
                    positionMap.get(child.key) || new vscode.Range(0, 0, 0, 1),
                    ValidationHelper.getUnexecptedAttributeAtTopLevel(
                        child.key,
                    ),
                    vscode.DiagnosticSeverity.Error,
                );
                if (
                    !ValidationHelper.diagnosticExists(
                        diagnosticsList,
                        newDiagnostic,
                    )
                ) {
                    diagnosticsList.push(newDiagnostic);
                }
            }
        });

        // Ensure `query` or `knn` are present
        if (
            (counter.get("query") || 0) === 0 &&
            (counter.get("knn") || 0) === 0
        ) {
            const requiredKeyError = new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 1),
                ValidationHelper.getRequiredQueryKnnErrorMessage(),
                vscode.DiagnosticSeverity.Error,
            );
            if (
                !ValidationHelper.diagnosticExists(
                    diagnosticsList,
                    requiredKeyError,
                )
            ) {
                diagnosticsList.push(requiredKeyError);
            }
        }

        //TODO: Ensure only a single occurrence of each root key
        for (const [key, count] of counter.entries()) {
            if (count > 1) {
                const multipleOccurrenceError = new vscode.Diagnostic(
                    positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
                    `The attribute '${key}' must appear once at the top level, found ${count} occurrences`,
                    vscode.DiagnosticSeverity.Error,
                );
                if (
                    !ValidationHelper.diagnosticExists(
                        diagnosticsList,
                        multipleOccurrenceError,
                    )
                ) {
                    diagnosticsList.push(multipleOccurrenceError);
                }
            }
        }
    }
}
