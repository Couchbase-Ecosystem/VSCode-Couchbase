import * as vscode from 'vscode';
import { SearchObjectValidator } from './searchValidator';
import { RootObjectValidator } from './rootObjectValidator';
import { QueryObjectValidator } from './queryObjectValidator';
import { QueryTypeObjectValidator } from './queryTypeObjectValidator';
import { MatchAllNoneObjectValidator } from './matchAllNoneObjectValidator'
import { KnnObjectValidator } from './knnObjectValidator'
import { BooleanObjectValidator } from './booleanObjectValidator'
import { CtlConsistencyObjectValidator } from './ctlConsistencyObjectValidator'
import { CTLObjectValidator } from './ctlObjectValidator'
import { HighlightObjectValidator } from './highlightObjectValidator'
import { GeometryObjectValidator } from './geometryObjectValidator'
import { ShapeObjectValidator } from './shapeObjectValidator'
import { JsonObject, JsonArray, JsonProperty, JsonNode } from './JsonNodes';
import { ValidationHelper } from './validationHelper';



interface ValidationRule {
    type: string;
    isTopLevel?: boolean;
}


const PROPERTY_RULES: Record<string, ValidationRule> = {
    "ctl":{type:"json"},
    "highlight":{type:"json"},
    "facets":{type:"json"},
    "knn": { type: "array" },
    "size": { type: "number" },
    "from": { type: "number" },
    "fields": { type: "array" },
    "explain": { type: "boolean" },
    "sort": { type: "array" },
    "includeLocations": { type: "boolean" },
    "score": { type: "string" },
    "search_after": { type: "array" },
    "search_before": { type: "array" },
    "limit": { type: "number" },
    "offset": { type: "number" },
    "collections": { type: "array" },
    "consistency": { type: "json" },
    "vectors": { type: "json" },
    "match_all": { type: "json" },
    "match_none": { type: "json" },
    "must": { type: "json" },
    "must_not": { type: "json" },
    "should": { type: "json" },
    "shape": { type: "json" },
    "field": { type: "string" },
    "vector": { type: "array" },
    "timeout": { type: "number" },
    "k": { type: "number" },
    "style": { type: "string" },
    "results": { type: "string" },
    "level": { type: "string" },
    "match": { type: "string" },
    "analyzer": { type: "string" },
    "operator": { type: "string" },
    "boost": { type: "number" },
    "fuzziness": { type: "number" },
    "prefix_length": { type: "number" },
    "match_phrase": { type: "string" },
    "bool": { type: "boolean" },
    "prefix": { type: "string" },
    "term": { type: "string" },
    "regexp": { type: "string" },
    "terms": { type: "array" },
    "wildcard": { type: "string" },
    "cidr": { type: "string" },
    "inclusive_min": { type: "boolean" },
    "inclusive_max": { type: "boolean" },
    "inclusive_start": { type: "boolean" },
    "inclusive_end": { type: "boolean" },
    "start": { type: "string" },
    "end": { type: "string" },
    "conjuncts": { type: "array" },
    "disjuncts": { type: "array" },
    "relation": { type: "string" },
    "type": { type: "string" },
    "coordinates": { type: "array" },
    "radius": { type: "string" },
    "geometries": { type: "array" },
    "geometry": { type: "json" }
};


const validators: SearchObjectValidator[] = [new RootObjectValidator, new QueryObjectValidator(), new GeometryObjectValidator(), new ShapeObjectValidator(), new KnnObjectValidator(), new BooleanObjectValidator(), new CtlConsistencyObjectValidator(), new CTLObjectValidator(), new HighlightObjectValidator(), new MatchAllNoneObjectValidator(), new QueryTypeObjectValidator()];

export function validateDocument(document: vscode.TextDocument | undefined, diagnostics: vscode.DiagnosticCollection) {
    if (!document){
        return
    }

    const diagnosticsList: vscode.Diagnostic[] = [];
    const jsonContent = document.getText();

    try {

        const rawJsonObject = JSON.parse(jsonContent);
        const jsonObject = buildJsonStructure(rawJsonObject, null) as JsonObject;

        // Visit the Json Object
        visitJsonObject(jsonObject, diagnosticsList, document);

    } catch (error) {
        diagnosticsList.push(new vscode.Diagnostic(new vscode.Range(0, 0, 0, 1), `Invalid JSON: ${error}`,vscode.DiagnosticSeverity.Error));
    }

    diagnostics.set(document.uri, diagnosticsList);
}


function buildJsonStructure(data: any, parent: JsonNode | null = null): JsonNode {
    if (Array.isArray(data)) {
        const jsonArray = new JsonArray(parent);
        data.forEach(item => {
            jsonArray.children.push(buildJsonStructure(item, jsonArray));
        });
        return jsonArray;
    } else if (typeof data === 'object' && data !== null) {
        const jsonObject = new JsonObject(parent);
        Object.entries(data).forEach(([key, value]) => {
            const childNode = buildJsonStructure(value, jsonObject);
            // Only create JsonProperty for each key-value pair
            jsonObject.children.push(new JsonProperty(key, childNode, jsonObject));
        });
        return jsonObject;
    } else {
        return new JsonProperty('leaf', data, parent); 
    }
}



// Visitor function for JsonObject
function visitJsonObject(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument, inheritedKey: string | null = null): void {
    let contextKey = inheritedKey || determineContextKey(jsonObject);


    validators.forEach(validator => {
        if (validator.accept(contextKey)) {
            validator.validate(jsonObject, diagnosticsList, document, contextKey);
        }
    });

    jsonObject.children.forEach(child => {
        visitNode(child, diagnosticsList, document, contextKey);
    });
}

function visitJsonArray(jsonArray: JsonArray, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument, inheritedKey: string | null = null): void {
    jsonArray.children.forEach(child => {
        visitNode(child, diagnosticsList, document, inheritedKey);
    });
}

function visitJsonProperty(jsonProperty: JsonProperty, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument, inheritedKey: string | null = null): void {
    const contextKey = jsonProperty.key;  

    validateProperty(jsonProperty, contextKey, diagnosticsList, document);

    validators.forEach(validator => {
        if (validator.accept(contextKey)) {
            validator.validate(jsonProperty.value, diagnosticsList, document, contextKey);
        }
    });

    if (jsonProperty.value instanceof JsonObject) {
        visitJsonObject(jsonProperty.value, diagnosticsList, document, contextKey);
    } else if (jsonProperty.value instanceof JsonArray) {
        visitJsonArray(jsonProperty.value, diagnosticsList, document, contextKey);
    }
}

function visitNode(node: JsonNode, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument, contextKey: string | null): void {
    if (node instanceof JsonObject) {
        visitJsonObject(node, diagnosticsList, document, contextKey);
    } else if (node instanceof JsonArray) {
        visitJsonArray(node, diagnosticsList, document, contextKey);
    } else if (node instanceof JsonProperty) {
        visitJsonProperty(node, diagnosticsList, document, contextKey);
    }
}

function determineContextKey(jsonObject: JsonObject): string | null {
    if (jsonObject.parent instanceof JsonProperty) {
        return jsonObject.parent.key;
    } else if (jsonObject.parent instanceof JsonArray && jsonObject.parent.parent instanceof JsonProperty) {
        return jsonObject.parent.parent.key;
    } else {
        return null;
    }
}

function validateProperty(property: JsonProperty, contextKey:string, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument){
    const key = property.key;
    const value = property.value; 
    const positionMap = ValidationHelper.getPositionMap(document);

    if (key === "query") {
        if (isTopLevel(property)) {
            validateType(value, "json", diagnosticsList, document, property);
        } else {
            validateType(value, "string", diagnosticsList, document, property);
        }
    } else if (["location", "top_left", "bottom_right"].includes(key)) {
        validateLocation(property, diagnosticsList, document);
    } else if (["min", "max"].includes(key)) {
        if (typeof value.value !== "string" && typeof value.value !== "number") {
            const message = `'${key}' should be an integer for a numeric range query or a string for term range query`;
            diagnosticsList.push(new vscode.Diagnostic(
                positionMap.get(property.key) || new vscode.Range(0, 0, 0, 1),
                message,
                vscode.DiagnosticSeverity.Error
            ));
        }
    } else if (["distance", "radius"].includes(key)) {
        validateDistance(property, diagnosticsList, document);
    } else if (key === "polygon_points") {
        validatePolygonPoints(property, diagnosticsList, document);
    } else {
        if (key in PROPERTY_RULES) {
            validateType(value, PROPERTY_RULES[key].type, diagnosticsList, document, property);
        }
    }
    }



function isTopLevel(property: JsonProperty): boolean {
    // Checks if the property's parent is either null or the root JsonObject
    return !property.parent || property.parent.parent === null;
}

function validateType(value: any, expectedType: string, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument, property: JsonProperty): void {
    let isValid = false;
    let type;

    if (value instanceof JsonProperty) {
        const type = typeof value.value;
        switch (expectedType) {
            case "number":
                isValid = type === "number";
                break;
            case "string":
                isValid = type === "string";
                break;
            case "boolean":
                isValid = type === "boolean";
                break;
        }
    } else if (value instanceof JsonObject) {
        isValid = expectedType === "json";
        type = 'json';
    } else if (value instanceof JsonArray) {
        isValid = expectedType === "array";
        type = 'array';
    }

    if (!isValid) {
        const positionMap = ValidationHelper.getPositionMap(document);
        diagnosticsList.push(new vscode.Diagnostic(
            positionMap.get(property.key) || new vscode.Range(0, 0, 0, 1),
            `Expected ${expectedType} for property '${property.key}' `,
            vscode.DiagnosticSeverity.Error
        ));
    }
}


export function findRange(document: vscode.TextDocument, searchTerm: string): vscode.Range {
    const regex = new RegExp(`"${searchTerm}"\\s*:\\s*`, 'g');
    const match = regex.exec(document.getText());
    if (match) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        return new vscode.Range(startPos, endPos);
    }
    return new vscode.Range(0, 0, 0, 1);
}


function validateLocation(property: JsonProperty, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument) {
    const key = property.key;
    const value = property.value;
    const positionMap = ValidationHelper.getPositionMap(document);


    if (value instanceof JsonArray) {
        if (value.children.length !== 2) {
            diagnosticsList.push(new vscode.Diagnostic(
                positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
                ValidationHelper.getExpectedArrayLengthMessage(key, 2, value.children.length),
                vscode.DiagnosticSeverity.Error
            ));
        }
    } else if (value instanceof JsonObject) {
        const attrs = value.children.map(child => (child as JsonProperty).key);  
        if (attrs.length !== 2 || !attrs.includes("lat") || !attrs.includes("lon")) {
            diagnosticsList.push(new vscode.Diagnostic(
                positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
                ValidationHelper.getExpectedObjectPropertiesMessage(key),
                vscode.DiagnosticSeverity.Error
            ));
        }
    } else {
        diagnosticsList.push(new vscode.Diagnostic(
            positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
            ValidationHelper.getExpectedArrayOrObjectMessage(key, typeof value),
            vscode.DiagnosticSeverity.Error
        ));
    }
}

function validateDistance(property: JsonProperty, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument) {
    const key = property.key;
    const value = property.value.value; 
    const positionMap = ValidationHelper.getPositionMap(document);

    if (typeof value !== "string") {
        diagnosticsList.push(new vscode.Diagnostic(
            positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
            ValidationHelper.getExpectedDataTypeErrorMessage("string",key),
            vscode.DiagnosticSeverity.Error
        ));
        return;
    }
    const validUnits = ["mm", "cm", "in", "yd", "ft", "km", "mi", "nm", "m"];
    const hasValidUnit = validUnits.some(unit => value.endsWith(unit));

    if (!hasValidUnit) {
        diagnosticsList.push(new vscode.Diagnostic(
            positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
            ValidationHelper.getInvalidDistanceUnitErrorMessage(key, validUnits),
            vscode.DiagnosticSeverity.Error
        ));
    }
}


function validatePolygonPoints(property: JsonProperty, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument) {
    const key = property.key;
    const value = property.value as JsonArray; 
    const positionMap = ValidationHelper.getPositionMap(document);

    if (!(value instanceof JsonArray)) {  
        diagnosticsList.push(new vscode.Diagnostic(
            positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
            ValidationHelper.getExpectedDataTypeErrorMessage("array", key),
            vscode.DiagnosticSeverity.Error
        ));
        return;
    }

    value.children.forEach((item, index) => {
        const type = item as JsonProperty;
        if (typeof type.value === "string") {
            if (!type.value.includes(",")) {
                diagnosticsList.push(new vscode.Diagnostic(
                    positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
                    ValidationHelper.getExpectedLatLonMessage(`${key}[${index}]`),
                    vscode.DiagnosticSeverity.Error
                ));
            }
        } else {
            diagnosticsList.push(new vscode.Diagnostic(
                positionMap.get(`${key}[${index}]`) || new vscode.Range(0, 0, 0, 1),
                ValidationHelper.getExpectedDataTypeErrorMessage("string", `${key}[${index}]`),
                vscode.DiagnosticSeverity.Error
            ));
        }
    });
}




