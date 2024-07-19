import * as vscode from "vscode";
import { SearchObjectValidator } from "./searchValidator";
import { JsonObject, JsonProperty } from "./JsonNodes";
import { ValidationHelper } from "./validationHelper";

export class CtlConsistencyObjectValidator implements SearchObjectValidator {
    accept(key: string | null): boolean {
        return key === "consistency";
    }

    validate(
        jsonObject: JsonObject,
        diagnosticsList: vscode.Diagnostic[],
        document: vscode.TextDocument,
        key: string,
    ): void {
        const counter: Map<string, number> = new Map();
        let level: string | null = null;
        let results: string | null = null;
        const positionMap = ValidationHelper.getPositionMap(document);

        jsonObject.children.forEach((child) => {
            if (child instanceof JsonProperty) {
                const propertyKey = child.key;
                const propertyValue = child.value;
                if (!["vectors", "level", "results"].includes(propertyKey)) {
                    const newDiagnostic = new vscode.Diagnostic(
                        positionMap.get(propertyKey) ||
                            new vscode.Range(0, 0, 0, 1),
                        ValidationHelper.getUnexpectedAttributeMessage(
                            propertyKey,
                            "consistency",
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
                } else {
                    counter.set(
                        propertyKey,
                        (counter.get(propertyKey) || 0) + 1,
                    );
                }
                if (propertyKey === "level") {
                    if (
                        !["at_plus", "not_bounded"].includes(
                            propertyValue.value,
                        )
                    ) {
                        const newDiagnostic = new vscode.Diagnostic(
                            positionMap.get("level") ||
                                new vscode.Range(0, 0, 0, 1),
                            ValidationHelper.getLevelValuesErrorMessage(),
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
                        level = propertyValue.value;
                    }
                }

                if (propertyKey === "results") {
                    results = propertyValue.value;
                }
            }
        });

        if ((counter.get("level") || 0) === 0) {
            const newDiagnostic = new vscode.Diagnostic(
                positionMap.get("consistency") || new vscode.Range(0, 0, 0, 1),
                ValidationHelper.getMissingAttributeMessage(
                    "level",
                    "consistency",
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

        if (level === "at_plus" && (counter.get("vectors") || 0) === 0) {
            const newDiagnostic = new vscode.Diagnostic(
                positionMap.get("consistency") || new vscode.Range(0, 0, 0, 1),
                ValidationHelper.getMissingAttributeMessage(
                    "vectors",
                    "consistency",
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

        if (results !== null && results !== "complete") {
            const newDiagnostic = new vscode.Diagnostic(
                positionMap.get("results") || new vscode.Range(0, 0, 0, 1),
                ValidationHelper.getResultErrorMessage(),
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
}

// TODO: Check for multiple occurrences of optional keys
// counter.forEach((count, propertyKey) => {
//     if (count > 1) {
//         diagnosticsList.push(new vscode.Diagnostic(
//             positionMap.get(propertyKey) || new vscode.Range(0, 0, 0, 1),
//             CtlConsistencyObjectValidator.singleOptionalKeyOccurrenceMessage(propertyKey, "consistency"),
//             vscode.DiagnosticSeverity.Error
//         ));
//     }
// });
