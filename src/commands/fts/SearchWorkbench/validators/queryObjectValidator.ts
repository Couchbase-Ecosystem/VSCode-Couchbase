import * as vscode from 'vscode';
import { SearchObjectValidator } from './searchValidator';
import { JsonObject, JsonProperty } from './JsonNodes';
import { ValidationHelper } from './validationHelper';

export class QueryObjectValidator implements SearchObjectValidator {
    private validQueryKeys: Set<string>;

    constructor() {
        this.validQueryKeys = new Set([
            "must", "query", "must_not", "should", "disjuncts", "conjuncts",
            "match", "field", "analyzer", "operator", "match_phrase", "bool",
            "prefix", "regexp", "term", "fuzziness", "terms", "wildcard", "min",
            "max", "inclusive_min", "inclusive_max", "start", "prefix_length",
            "end", "inclusive_start", "inclusive_end", "cidr", "location", "distance",
            "top_left", "bottom_right", "polygon_points", "geometry", "match_all", "match_none", "analyzer", "boost"
        ]);
    }

    accept(key: string | null): boolean {
        return key === "query";
    }

    validate(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        if (!jsonObject || !(jsonObject instanceof JsonObject)) {
            return;
        }

        jsonObject.children.forEach(child => {
            if (child instanceof JsonProperty) {
                this.validateProperty(child, diagnosticsList, document);
            }
        });
    }

    private validateProperty(property: JsonProperty, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        const key = property.key;
        const positionMap = ValidationHelper.getPositionMap(document);
    
        if (!this.validQueryKeys.has(key)) {
            const message = ValidationHelper.getUnexpectedAttributeMessage(key, "query");
            const newDiagnostic = new vscode.Diagnostic(
                positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
                message,
                vscode.DiagnosticSeverity.Error
            );
    
            if (!ValidationHelper.diagnosticExists(diagnosticsList, newDiagnostic)) {
                diagnosticsList.push(newDiagnostic);
            }
        }
    }

}