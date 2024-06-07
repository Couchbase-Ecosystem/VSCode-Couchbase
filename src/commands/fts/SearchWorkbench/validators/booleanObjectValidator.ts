import * as vscode from 'vscode';
import { SearchObjectValidator } from './searchValidator';
import { JsonObject, JsonProperty } from './JsonNodes';
import { ValidationHelper } from './validationHelper';

export class BooleanObjectValidator implements SearchObjectValidator {
    accept(key: string | null): boolean {
        return key === "must" || key === "must_not" || key === "should";
    }

    validate(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument, key: string): void {
        const attrs = jsonObject.children.map(child => child instanceof JsonProperty ? child.key : null).filter(key => key !== null);
        const positionMap = ValidationHelper.getPositionMap(document);
    
        if (key === "must") {
            if (attrs.length !== 1 || !attrs.includes("conjuncts")) {
                const newDiagnostic = new vscode.Diagnostic(
                    positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
                    ValidationHelper.getMustConjunctsErrorMessage(),
                    vscode.DiagnosticSeverity.Error
                );
                if (!ValidationHelper.diagnosticExists(diagnosticsList, newDiagnostic)) {
                    diagnosticsList.push(newDiagnostic);
                }
            }
        } else if (key === "must_not") {
            if (attrs.length !== 1 || !attrs.includes("disjuncts")) {
                const newDiagnostic = new vscode.Diagnostic(
                    positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
                    ValidationHelper.getMustNotDisjunctsErrorMessage(),
                    vscode.DiagnosticSeverity.Error
                );
                if (!ValidationHelper.diagnosticExists(diagnosticsList, newDiagnostic)) {
                    diagnosticsList.push(newDiagnostic);
                }
            }
        } else if (key === "should") {
            if (!(attrs.length === 1 && attrs.includes("disjuncts")) &&
                !(attrs.length === 2 && attrs.includes("disjuncts") && attrs.includes("min"))) {
                const newDiagnostic = new vscode.Diagnostic(
                    positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
                    ValidationHelper.getShouldErrorMessage(),
                    vscode.DiagnosticSeverity.Error
                );
                if (!ValidationHelper.diagnosticExists(diagnosticsList, newDiagnostic)) {
                    diagnosticsList.push(newDiagnostic);
                }
            }
        }
    }
    


}