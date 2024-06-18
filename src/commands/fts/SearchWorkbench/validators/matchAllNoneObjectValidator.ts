import * as vscode from 'vscode';
import { SearchObjectValidator } from './searchValidator';
import { JsonObject } from './JsonNodes';
import { ValidationHelper } from './validationHelper';

export class MatchAllNoneObjectValidator implements SearchObjectValidator {
    accept(key: string | null): boolean {
        return key === "match_none" || key === "match_all";
    }

    validate(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument, contextKey: string): void {
        if (jsonObject.children.length > 0) {
            const positionMap = ValidationHelper.getPositionMap(document);
            const range = positionMap.get(contextKey) || new vscode.Range(0, 0, 0, 1);
            const message = ValidationHelper.getMatchAllNoneNoAttributeErrorMessage(contextKey);
            const newDiagnostic = new vscode.Diagnostic(
                range,
                message,
                vscode.DiagnosticSeverity.Error
            );
    
            if (!ValidationHelper.diagnosticExists(diagnosticsList, newDiagnostic)) {
                diagnosticsList.push(newDiagnostic);
            }
        }
    }

}



