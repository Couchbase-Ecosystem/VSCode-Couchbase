
import * as vscode from 'vscode';
import { SearchObjectValidator } from './searchValidator'; 
import { JsonObject, JsonProperty } from './JsonNodes';
import { ValidationHelper } from './validationHelper';

export class KnnObjectValidator implements SearchObjectValidator {
    private validKnnKeys: Set<string>;

    constructor() {
        this.validKnnKeys = new Set([
            "k", "field", "vector" 
        ]);
    }

    accept(key: string | null): boolean {
        return key === "knn";
    }

    validate(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        if (!jsonObject || !(jsonObject instanceof JsonObject)) {
            return;
        }
    
        const counter: Map<string, number> = new Map();
        const positionMap = ValidationHelper.getPositionMap(document);
    
        jsonObject.children.forEach(child => {
            if (child instanceof JsonProperty) {
                this.validateProperty(child, counter, diagnosticsList, document, positionMap);
            }
        });
    
        ['k', 'field', 'vector'].forEach(key => {
            const count = counter.get(key) || 0;
            if (count !== 1) {
                const message = `The key '${key}' must appear exactly once under 'knn', found ${count} occurrences`;
                const newDiagnostic = new vscode.Diagnostic(
                    positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
                    message,
                    vscode.DiagnosticSeverity.Error
                );
                if (!ValidationHelper.diagnosticExists(diagnosticsList, newDiagnostic)) {
                    diagnosticsList.push(newDiagnostic);
                }
            }
        });
    }

    private validateProperty(property: JsonProperty, counter: Map<string, number>, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument, positionMap: Map<string, vscode.Range>): void {
        const key = property.key;
        if (!this.validKnnKeys.has(key)) {
            diagnosticsList.push(new vscode.Diagnostic(
                positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
                `Unexpected attribute '${key}' under 'knn' object`,
                vscode.DiagnosticSeverity.Error
            ));
        } else {
            counter.set(key, (counter.get(key) || 0) + 1);
        }
    }



    // TODO: add countcheck
    // private countOccurrencesFromText(jsonText: string): Map<string, number> {
    //     const occurrencesMap = new Map<string, number>();
    //     const keyRegex = /"(\w+)"\s*:/g; // Matches keys in JSON text
    //     let match;

    //     while ((match = keyRegex.exec(jsonText)) !== null) {
    //         const key = match[1];
    //         occurrencesMap.set(key, (occurrencesMap.get(key) || 0) + 1);
    //     }

    //     return occurrencesMap;
    // }

}
