import * as vscode from "vscode";
import { SearchObjectValidator } from "./searchValidator";
import { JsonObject, JsonProperty } from "./JsonNodes";
import { ValidationHelper } from "./validationHelper";

export class CTLObjectValidator implements SearchObjectValidator {
    accept(key: string | null): boolean {
        return key === "ctl";
    }

    validate(
        jsonObject: JsonObject,
        diagnosticsList: vscode.Diagnostic[],
        document: vscode.TextDocument,
        key: string,
    ): void {
        if (!jsonObject || !(jsonObject instanceof JsonObject)) {
            return;
        }
        const counter: Map<string, number> = new Map();
        const positionMap = ValidationHelper.getPositionMap(document);

        jsonObject.children.forEach((child) => {
            if (child instanceof JsonProperty) {
                const propertyKey = child.key;
                if (!["consistency", "timeout"].includes(propertyKey)) {
                    const newDiagnostic = new vscode.Diagnostic(
                        positionMap.get(propertyKey) ||
                            new vscode.Range(0, 0, 0, 1),
                        ValidationHelper.getUnexpectedAttributeMessage(
                            propertyKey,
                            "ctl",
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
            }
        });

        // Check for required 'consistency' key
        if ((counter.get("consistency") || 0) === 0) {
            const newDiagnostic = new vscode.Diagnostic(
                positionMap.get("ctl") || new vscode.Range(0, 0, 0, 1),
                ValidationHelper.getSingleOccurrenceMessage(
                    "consistency",
                    "ctl",
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
    }
}

// TODO: Check for multiple occurrences of optional keys
// counter.forEach((count, propertyKey) => {
//     if (count > 1) {
//         diagnosticsList.push(new vscode.Diagnostic(
//             positionMap.get(propertyKey) || new vscode.Range(0, 0, 0, 1),
//             CTLObjectValidator.singleOptionalKeyOccurrenceMessage(propertyKey, "ctl"),
//             vscode.DiagnosticSeverity.Error
//         ));
//     }
// });
