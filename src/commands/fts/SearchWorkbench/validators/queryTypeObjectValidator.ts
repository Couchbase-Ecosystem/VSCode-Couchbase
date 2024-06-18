import * as vscode from 'vscode';
import { SearchObjectValidator } from './searchValidator';
import { ValidationHelper } from './validationHelper';
import { JsonObject, JsonProperty } from './JsonNodes';


export class QueryTypeObjectValidator implements SearchObjectValidator {
    accept(key: string): boolean {
        return key === "conjuncts" || key === "disjuncts" || key === "query";
    }

    validate(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument, key: string): void {

        if (!jsonObject || !(jsonObject instanceof JsonObject)) {
            return;
        }

        const containsQuery = this.containsQuery(jsonObject);
        const properties = jsonObject.children.map(child => (child as JsonProperty).key);
        const isFieldMissing = !properties.includes("field");
        const containsMatchAllNone = properties.includes("match_all") || properties.includes("match_none");
        const isBooleanQuery = properties.includes("must") || properties.includes("must_not") || properties.includes("should");
        const isCompound = this.validateCompound(jsonObject, properties, diagnosticsList, document);

        if (!containsMatchAllNone && !isCompound && !isBooleanQuery && !properties.includes("geometry")) {
            if (isFieldMissing && !containsQuery) {
                diagnosticsList.push(new vscode.Diagnostic(
                    ValidationHelper.getPositionMap(document).get(key) || new vscode.Range(0, 0, 0, 1),
                    QueryTypeObjectValidator.getMissingFieldOrQueryMessage(),
                    vscode.DiagnosticSeverity.Error
                ));
            } else if (!isFieldMissing && !containsQuery) {
                if (jsonObject.children.length === 1) {
                    diagnosticsList.push(new vscode.Diagnostic(
                        ValidationHelper.getPositionMap(document).get(key) || new vscode.Range(0, 0, 0, 1),
                        QueryTypeObjectValidator.getMissingFieldOperationMessage(),
                        vscode.DiagnosticSeverity.Error
                    ));
                } else {
                    this.validateQueryType(jsonObject, diagnosticsList, document);
                }
            } else {
                if (jsonObject.children.length > 1) {
                    diagnosticsList.push(new vscode.Diagnostic(
                        ValidationHelper.getPositionMap(document).get(key) || new vscode.Range(0, 0, 0, 1),
                        QueryTypeObjectValidator.getInvalidFieldWithQueryMessage(),
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            }
        }
    }

    static getQuerySingleAttMsg(): string {
        return "'query' doesn't support additional attributes";
    }

    private validateCompound(jsonObject: JsonObject, properties: string[], diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): boolean {
        const hasCompound = properties.includes("conjuncts") || properties.includes("disjuncts");
        const allowedCompoundAttrs = ["disjuncts", "conjuncts", "min"];

        if (hasCompound) {
            jsonObject.children.forEach(child => {
                if (!(child instanceof JsonProperty) || !allowedCompoundAttrs.includes((child as JsonProperty).key)) {
                    diagnosticsList.push(new vscode.Diagnostic(
                        ValidationHelper.getPositionMap(document).get((child as JsonProperty).key) || new vscode.Range(0, 0, 0, 1),
                        QueryTypeObjectValidator.getFieldNotAllowedOnCompound(),
                        vscode.DiagnosticSeverity.Error
                    ));
                }
            });
        }

        return hasCompound;
    }

    static getFieldNotAllowedOnCompound(): string {
        return "This field is not allowed at this level when the query contains disjuncts and/or conjuncts";
    }

    static getMissingFieldOperationMessage(): string {
        return "The operation has been specified for the target field";
    }

    static getMissingFieldOrQueryMessage(): string {
        return "The attribute 'query' or 'field' is expected";
    }

    static getInvalidFieldWithQueryMessage(): string {
        return "No additional attributes are supported with 'query'";
    }

    private containsQuery(jsonObject: JsonObject): boolean {
        // Check if jsonObject has any children
        if (!jsonObject.children || jsonObject.children.length === 0) {
            return false;
        }

        for (const child of jsonObject.children) {
            // Check if the child is a JsonProperty
            if (child instanceof JsonProperty) {
                // Check if the key of the JsonProperty is "query"
                if (child.key === "query") {
                    return true;
                }
            }
        }

        return false;
    }

    private validateQueryType(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        jsonObject.children.forEach(child => {
            if (!(child instanceof JsonProperty)) {
                return;
            }

            const property = child as JsonProperty;
            const propertyKey = property.key;



            switch (propertyKey) {
                case "match":
                    this.validateMatch(jsonObject, diagnosticsList, document);
                    return;
                case "match_phrase":
                    this.validateMatchPhrase(jsonObject, diagnosticsList, document);
                    return;
                case "bool":
                    this.validateBoolean(jsonObject, diagnosticsList, document);
                    return;
                case "prefix":
                    this.validatePrefix(jsonObject, diagnosticsList, document);
                    return;
                case "regexp":
                    this.validateRegex(jsonObject, diagnosticsList, document);
                    return;
                case "term":
                    this.validateTerm(jsonObject, diagnosticsList, document);
                    return;
                case "terms":
                    this.validateTerms(jsonObject, diagnosticsList, document);
                    return;
                case "wildcard":
                    this.validateWildcard(jsonObject, diagnosticsList, document);
                    return;
                case "cidr":
                    this.validateCidr(jsonObject, diagnosticsList, document);
                    return;
                case "inclusive_min":
                case "inclusive_max":
                    this.validateGenericRange(jsonObject, diagnosticsList, document);
                    return;
                case "min":
                case "max":
                    const type = typeof property.value.value
                    if (type === "number") {
                        this.validateNumericRange(jsonObject, diagnosticsList, document);
                        return;
                    } else if (type === "string") {
                        this.validateTermRange(jsonObject, diagnosticsList, document);
                        return;
                    } else {
                        diagnosticsList.push(new vscode.Diagnostic(
                            ValidationHelper.getPositionMap(document).get(propertyKey) || new vscode.Range(0, 0, 0, 1),
                            QueryTypeObjectValidator.invalidQueryFormatMessage(),
                            vscode.DiagnosticSeverity.Error
                        ));
                        return;
                    }
                case "inclusive_start":
                case "inclusive_end":
                case "start":
                case "end":
                    this.validateDateRange(jsonObject, diagnosticsList, document);
                    return;
                case "distance":
                case "location":
                    this.validateDistanceRadius(jsonObject, diagnosticsList, document);
                    return;
                case "top_left":
                case "bottom_right":
                    this.validateRectangle(jsonObject, diagnosticsList, document);
                    return;
                case "polygon_points":
                    return;

            }

        });

    }


    validateAttribute(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument, target: string, allowedFields: string[], requiredFields: string[]): void {
        const counter: Map<string, number> = new Map();
        const currentAttributes: string[] = [];

        jsonObject.children.forEach(child => {
            if (!(child instanceof JsonProperty)) {
                return;
            }

            const property = child as JsonProperty;
            const propertyKey = property.key;
            currentAttributes.push(propertyKey);

            if (!allowedFields.includes(propertyKey)) {
                diagnosticsList.push(new vscode.Diagnostic(
                    ValidationHelper.getPositionMap(document).get(propertyKey) || new vscode.Range(0, 0, 0, 1),
                    ValidationHelper.getUnexpectedAttributeMessageForQuery(propertyKey, target),
                    vscode.DiagnosticSeverity.Error
                ));
            } else {
                counter.set(propertyKey, (counter.get(propertyKey) || 0) + 1);
            }

            // this.validateMultipleOccurrences(counter, jsonObject, diagnosticsList, document);
        });

        const missingFields = requiredFields.filter(field => !currentAttributes.includes(field));
        if (currentAttributes.length > 0 && missingFields.length > 0) {
            diagnosticsList.push(new vscode.Diagnostic(
                ValidationHelper.getPositionMap(document).get(target) || new vscode.Range(0, 0, 0, 1),
                ValidationHelper.missingRequiredAttributeQuery(missingFields.join(", "), target),
                vscode.DiagnosticSeverity.Error
            ));
        }
    }

    validateBoolean(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        this.validateAttribute(jsonObject, diagnosticsList, document, "boolean", ["field", "bool", "boost"], ["field", "bool"]);
    }

    validatePrefix(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        this.validateAttribute(jsonObject, diagnosticsList, document, "prefix", ["field", "prefix", "boost"], ["field", "prefix"]);
    }

    validateRegex(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        this.validateAttribute(jsonObject, diagnosticsList, document, "regex", ["field", "regexp", "boost"], ["field", "regexp"]);
    }

    validateTerm(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        this.validateAttribute(jsonObject, diagnosticsList, document, "term", ["field", "term", "boost", "fuzziness"], ["field", "term"]);
    }

    validateTerms(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        this.validateAttribute(jsonObject, diagnosticsList, document, "terms", ["field", "terms", "boost"], ["field", "terms"]);
    }

    validateWildcard(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        this.validateAttribute(jsonObject, diagnosticsList, document, "wildcard", ["field", "wildcard", "boost"], ["field", "wildcard"]);
    }

    validateCidr(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        this.validateAttribute(jsonObject, diagnosticsList, document, "cidr", ["field", "cidr", "boost"], ["field", "cidr"]);
    }

    validateGenericRange(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        const properties = jsonObject.children.map(child => (child as JsonProperty).key);
        if (!properties.includes("min") && !properties.includes("max")) {
            diagnosticsList.push(new vscode.Diagnostic(
                ValidationHelper.getPositionMap(document).get("min") || new vscode.Range(0, 0, 0, 1),
                QueryTypeObjectValidator.minOrMaxRequiredMessage(),
                vscode.DiagnosticSeverity.Error
            ));
        }
    }

    validateNumericRange(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        this.validateAttribute(jsonObject, diagnosticsList, document, "numeric range", ["field", "min", "max", "inclusive_min", "inclusive_max", "boost"], ["field"]);
    }

    validateTermRange(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        this.validateAttribute(jsonObject, diagnosticsList, document, "term range", ["field", "min", "max", "inclusive_min", "inclusive_max", "boost"], ["field"]);
    }

    validateDistanceRadius(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        this.validateAttribute(jsonObject, diagnosticsList, document, "distance radius", ["field", "location", "distance", "boost"], ["field", "location", "distance"]);
    }

    validateRectangle(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        this.validateAttribute(jsonObject, diagnosticsList, document, "rectangle based", ["field", "top_left", "bottom_right", "boost"], ["field", "top_left", "bottom_right"]);
    }

    validateDateRange(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        this.validateAttribute(jsonObject, diagnosticsList, document, "date range", ["field", "start", "end", "inclusive_start", "inclusive_end", "boost"], ["field"]);

        const properties = jsonObject.children.map(child => (child as JsonProperty).key);
        if (!properties.includes("start") && !properties.includes("end")) {
            diagnosticsList.push(new vscode.Diagnostic(
                ValidationHelper.getPositionMap(document).get("start") || new vscode.Range(0, 0, 0, 1),
                QueryTypeObjectValidator.startOrEndRequiredMessage(),
                vscode.DiagnosticSeverity.Error
            ));
        }
    }

    validateMatch(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        this.validateAttribute(jsonObject, diagnosticsList, document, "match", ["field", "match", "analyzer", "operator", "fuzziness", "boost", "prefix_length"], ["field", "match"]);

        let matchValue: string | null = null;
        let isOperatorPresent = false;

        jsonObject.children.forEach(child => {
            if (!(child instanceof JsonProperty)) {
                return;
            }

            const property = child as JsonProperty;
            const propertyKey = property.key;

            if (propertyKey === "match" && typeof property.value.value == "string") {
                matchValue = property.value.value;
            } else if (propertyKey === "operator") {
                isOperatorPresent = true;
                this.validateOperatorValue(diagnosticsList, property, document);
            }
        });
        if (matchValue !== null && (matchValue as string).includes(" ") && !isOperatorPresent) {
            diagnosticsList.push(new vscode.Diagnostic(
                ValidationHelper.getPositionMap(document).get("match") || new vscode.Range(0, 0, 0, 1),
                QueryTypeObjectValidator.matchWithSpaceMessage(),
                vscode.DiagnosticSeverity.Error
            ));
        }
    }


    validateMatchPhrase(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
        this.validateAttribute(jsonObject, diagnosticsList, document, "match phrase", ["field", "match_phrase", "analyzer", "operator", "fuzziness", "boost"], ["field", "match_phrase"]);

        jsonObject.children.forEach(child => {
            if (!(child instanceof JsonProperty)) {
                return;
            }

            const property = child as JsonProperty;
            if (property.key === "operator") {
                this.validateOperatorValue(diagnosticsList, property, document);
            }
        });
    }

    private validateOperatorValue(diagnosticsList: vscode.Diagnostic[], property: JsonProperty, document: vscode.TextDocument): void {
        if (property.value.value !== "or" && property.value.value !== "and") {
            diagnosticsList.push(new vscode.Diagnostic(
                ValidationHelper.getPositionMap(document).get(property.key) || new vscode.Range(0, 0, 0, 1),
                QueryTypeObjectValidator.invalidOperatorMessage(),
                vscode.DiagnosticSeverity.Error
            ));
        }
    }
    static matchWithSpaceMessage(): string {
        return "'operator' needs to be defined when match value contains whitespaces";
    }

    static invalidOperatorMessage(): string {
        return "the value of 'operator' can only be 'or' or 'and'";
    }

    static invalidQueryFormatMessage(): string {
        return "Invalid query format";
    }

    static minOrMaxRequiredMessage(): string {
        return "'min' or 'max' is required for this query type";
    }

    static startOrEndRequiredMessage(): string {
        return "'start' or 'end' is required for this query type";
    }


    // TODO: add duplicate check
    // private validateMultipleOccurrences(counter: Map<string, number>, jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument): void {
    //     counter.forEach((value, key) => {
    //         if (value > 1) {
    //             diagnosticsList.push(new vscode.Diagnostic(
    //                 ValidationHelper.getPositionMap(document).get(key) || new vscode.Range(0, 0, 0, 1),
    //                 `Attribute '${key}' appears multiple times`,
    //                 vscode.DiagnosticSeverity.Error
    //             ));
    //         }
    //     });
    // }
}