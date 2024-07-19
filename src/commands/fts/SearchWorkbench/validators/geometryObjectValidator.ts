import * as vscode from "vscode";
import { SearchObjectValidator } from "./searchValidator";
import { JsonArray, JsonObject, JsonProperty } from "./JsonNodes";
import { ValidationHelper } from "./validationHelper";

export class GeometryObjectValidator implements SearchObjectValidator {
    accept(key: string | null): boolean {
        return key === "geometry";
    }

    validate(
        jsonObject: JsonObject,
        diagnosticsList: vscode.Diagnostic[],
        document: vscode.TextDocument,
        key: string,
    ): void {
        const target = "geometry";
        const requiredFields = ["shape", "relation"];
        const counter: Map<string, number> = new Map();
        const currentAttributes: string[] = [];
        const positionMap = ValidationHelper.getPositionMap(document);

        jsonObject.children.forEach((child) => {
            if (!(child instanceof JsonProperty)) {
                return;
            }

            const propertyKey = child.key;
            const propertyValue = child.value;
            currentAttributes.push(propertyKey);

            if (!["shape", "relation", "boost"].includes(propertyKey)) {
                const newDiagnostic = new vscode.Diagnostic(
                    positionMap.get(propertyKey) ||
                        new vscode.Range(0, 0, 0, 1),
                    `Unexpected attribute '${propertyKey}' for query '${target}'`,
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
            } else {
                counter.set(propertyKey, (counter.get(propertyKey) || 0) + 1);
                if (propertyKey === "relation") {
                    this.validateRelation(
                        propertyValue,
                        child,
                        diagnosticsList,
                        document,
                    );
                }
            }
        });

        this.checkMissingFields(
            requiredFields,
            currentAttributes,
            diagnosticsList,
            document,
            positionMap,
        );
        // this.validateMultipleOccurrences(counter, diagnosticsList, document); // Consider enabling if needed
    }

    private validateRelation(
        propertyValue: any,
        property: JsonProperty,
        diagnosticsList: vscode.Diagnostic[],
        document: vscode.TextDocument,
    ): void {
        if (
            !["intersects", "contains", "within"].includes(propertyValue.value)
        ) {
            const positionMap = ValidationHelper.getPositionMap(document);
            const newDiagnostic = new vscode.Diagnostic(
                positionMap.get("relation") || new vscode.Range(0, 0, 0, 1),
                ValidationHelper.getRelationErrorMessage(),
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
    }

    private checkMissingFields(
        requiredFields: string[],
        currentAttributes: string[],
        diagnosticsList: vscode.Diagnostic[],
        document: vscode.TextDocument,
        positionMap: any,
    ): void {
        requiredFields.forEach((field) => {
            if (!currentAttributes.includes(field)) {
                const newDiagnostic = new vscode.Diagnostic(
                    positionMap.get("geometry") || new vscode.Range(0, 0, 0, 1),
                    ValidationHelper.missingRequiredAttributeQuery(
                        field,
                        "geometry",
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
    }

    // TODO: add check multiple occurences
    // private validateMultipleOccurrences(counter: Map<string, number>, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
    //     for (const [key, count] of counter.entries()) {
    //         if (count > 1) {
    //             const range = this.findRange(document, key);
    //             diagnosticsList.push(new vscode.Diagnostic(
    //                 range,
    //                 `The attribute '${key}' must not appear more than once`,
    //                 vscode.DiagnosticSeverity.Error
    //             ));
    //         }
    //     }
    // }
}
