import * as vscode from 'vscode';
import { SearchObjectValidator } from './searchValidator';
import { JsonObject, JsonProperty } from './JsonNodes';
import { ValidationHelper } from './validationHelper';

export class HighlightObjectValidator implements SearchObjectValidator {
    accept(key: string | null): boolean {
        return key === "highlight";
    }

    validate(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument, key: string): void {
        const counter: Map<string, number> = new Map();
        const positionMap = ValidationHelper.getPositionMap(document);

        jsonObject.children.forEach(child => {
            if (child instanceof JsonProperty) {
                const propertyKey = child.key;
                const propertyValue = child.value.value;
                if (!["style", "fields"].includes(propertyKey)) {
                    const newDiagnostic = new vscode.Diagnostic(
                        positionMap.get(propertyKey) || new vscode.Range(0, 0, 0, 1),
                        HighlightObjectValidator.getUnexpectedAttUnderHighlight(propertyKey),
                        vscode.DiagnosticSeverity.Error
                    )
                    if (!ValidationHelper.diagnosticExists(diagnosticsList, newDiagnostic)) {
                        diagnosticsList.push(newDiagnostic);
                    }
                } else {
                    counter.set(propertyKey, (counter.get(propertyKey) || 0) + 1);
                }

                if (propertyKey === "style" && !["html", "ansi"].includes(propertyValue)) {
                    const newDiagnostic = new vscode.Diagnostic(
                        positionMap.get(propertyKey) || new vscode.Range(0, 0, 0, 1),
                        ValidationHelper.getStyleValuesErrorMessage(),
                        vscode.DiagnosticSeverity.Error
                    )
                    if (!ValidationHelper.diagnosticExists(diagnosticsList, newDiagnostic)) {
                        diagnosticsList.push(newDiagnostic);
                    }
                }
            }
        });

        // TODO: Check for multiple occurrences of each attribute
        // counter.forEach((count, propertyKey) => {
        //     if (count > 1) {
        //         diagnosticsList.push(new vscode.Diagnostic(
        //             positionMap.get(propertyKey) || new vscode.Range(0, 0, 0, 1),
        //             HighlightObjectValidator.singleKeyOccurrenceMessage(propertyKey),
        //             vscode.DiagnosticSeverity.Error
        //         ));
        //     }
        // });
    }

    private static getUnexpectedAttUnderHighlight(attribute: string): string {
        return `Unexpected attribute '${attribute}' under 'highlight' object`;
    }

    private static singleKeyOccurrenceMessage(key: string): string {
        return `The attribute '${key}' must not appear more than once under 'highlight'`;
    }

}