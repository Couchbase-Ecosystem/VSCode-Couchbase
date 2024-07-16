import * as vscode from 'vscode';
import { SearchObjectValidator } from './searchValidator';
import { JsonArray, JsonObject, JsonProperty } from './JsonNodes';
import { ValidationHelper } from './validationHelper';


export class ShapeObjectValidator implements SearchObjectValidator {
    accept(key: string | null): boolean {
        return key === "shape" || key === "geometries";
    }

    validate(jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument, key: string): void {
        const target = "shape";
        let requiredFields = ['type'];
        const counter: Map<string, number> = new Map();
        const currentAttributes: string[] = [];
        const positionMap = ValidationHelper.getPositionMap(document);
        let typeValue: string | null = null;
        let coordinates: JsonProperty | null = null;

        jsonObject.children.forEach(child => {
            if (!(child instanceof JsonProperty)) {
                return;
            }

            const propertyKey = child.key;
            const propertyValue = child.value;
            currentAttributes.push(propertyKey);


            if (propertyKey === "coordinates") {
                coordinates = child;
            }

            if (!["type", "coordinates", "geometries", "radius"].includes(propertyKey)) {
                const newDiagnostic = new vscode.Diagnostic(
                    positionMap.get(propertyKey) || new vscode.Range(0, 0, 0, 1),
                    `Unexpected attribute '${propertyKey}' for query '${target}'`,
                    vscode.DiagnosticSeverity.Error
                );
            
                if (!ValidationHelper.diagnosticExists(diagnosticsList, newDiagnostic)) {
                    diagnosticsList.push(newDiagnostic);
                }
            } else {
                counter.set(propertyKey, (counter.get(propertyKey) || 0) + 1);

                if (propertyKey === "type") {
                    typeValue = propertyValue.value;
                    this.validateType(typeValue, propertyValue, diagnosticsList, positionMap);
                }
            }

            // this.validateMultipleOccurrences(counter, jsonObject, diagnosticsList, positionMap);
        });
        requiredFields = requiredFields.filter(item => !currentAttributes.includes(item));
        requiredFields.forEach(field => {
            if (!currentAttributes.includes(field) && currentAttributes.length !== 0 && requiredFields.length !== 0) {
                const newDiagnostic = new vscode.Diagnostic(
                    positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
                    ValidationHelper.missingRequiredAttributeQuery(field, key),
                    vscode.DiagnosticSeverity.Error
                );
        
                if (!ValidationHelper.diagnosticExists(diagnosticsList, newDiagnostic)) {
                    diagnosticsList.push(newDiagnostic);
                }
            }
        });

        if (typeValue === "Circle") {
            this.validateCircle(currentAttributes, diagnosticsList, positionMap, key);
        } else if (typeValue === "GeometryCollection") {
            this.validateGeometryCollection(currentAttributes, diagnosticsList, positionMap, key);
        } else {
            if (typeValue) {
                this.validateCoordinates(typeValue, currentAttributes, coordinates, diagnosticsList, positionMap);
            }
        }

        if (typeValue && coordinates != null && (["LineString", "Polygon", "MultiLineString", "MultiPolygon", "Envelope", "MultiPoint"].includes(typeValue))) {
            this.validateCoordinatesStructure(coordinates, typeValue, diagnosticsList, document, key)
        }
    }

    private validateType(typeValue: string | null, property: JsonProperty, diagnosticsList: vscode.Diagnostic[], positionMap: any): void {
        if (typeValue !== null) {
            const validTypes = [
                "Point", "Circle", "Envelope", "LineString", "MultiPoint",
                "MultiLineString", "MultiPolygon", "GeometryCollection", "Polygon"
            ];
    
            if (!validTypes.includes(typeValue)) {
                const newDiagnostic = new vscode.Diagnostic(
                    positionMap.get(property.key) || new vscode.Range(0, 0, 0, 1),
                    `Invalid type '${typeValue}'`,
                    vscode.DiagnosticSeverity.Error
                );
    
                if (!ValidationHelper.diagnosticExists(diagnosticsList, newDiagnostic)) {
                    diagnosticsList.push(newDiagnostic);
                }
            }
        }
    }

    private validateCoordinatesStructure(coordinates: JsonArray, type: string, diagnosticsList: vscode.Diagnostic[], document: vscode.TextDocument, key: string): void {
        if (type && coordinates instanceof JsonArray) {
            if (!coordinates.children.every(child => child instanceof JsonArray)) {
                const positionMap = ValidationHelper.getPositionMap(document);
                const newDiagnostic = new vscode.Diagnostic(
                    positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
                    `'${type}' in '${key}' requires 'coordinates' to be an array of arrays.`,
                    vscode.DiagnosticSeverity.Error
                );
    
                if (!ValidationHelper.diagnosticExists(diagnosticsList, newDiagnostic)) {
                    diagnosticsList.push(newDiagnostic);
                }
            }
        }
    }

    private validateCircle(currentAttributes: string[], diagnosticsList: vscode.Diagnostic[], positionMap: any, key: string): void {
        if (!currentAttributes.includes("radius")) {
            const newDiagnostic = new vscode.Diagnostic(
                positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
                ValidationHelper.missingRequiredAttributeQuery("radius", key),
                vscode.DiagnosticSeverity.Error
            );
    
            if (!ValidationHelper.diagnosticExists(diagnosticsList, newDiagnostic)) {
                diagnosticsList.push(newDiagnostic);
            }
        }
        if (!currentAttributes.includes("coordinates")) {
            const newDiagnostic = new vscode.Diagnostic(
                positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
                ValidationHelper.missingRequiredAttributeQuery("coordinates", key),
                vscode.DiagnosticSeverity.Error
            );
    
            if (!ValidationHelper.diagnosticExists(diagnosticsList, newDiagnostic)) {
                diagnosticsList.push(newDiagnostic);
            }
        }
    }

    private validateGeometryCollection(currentAttributes: string[], diagnosticsList: vscode.Diagnostic[], positionMap: any, key: string): void {
        if (!currentAttributes.includes("geometries")) {
            const newDiagnostic = new vscode.Diagnostic(
                positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
                ValidationHelper.missingRequiredAttributeQuery("geometries", key),
                vscode.DiagnosticSeverity.Error
            );
    
            if (!ValidationHelper.diagnosticExists(diagnosticsList, newDiagnostic)) {
                diagnosticsList.push(newDiagnostic);
            }
        }
    }

    private validateCoordinates(typeValue: string | null, currentAttributes: string[], coordinates: JsonProperty | null, diagnosticsList: vscode.Diagnostic[], positionMap: any): void {
        if (!currentAttributes.includes("coordinates")) {
            const newDiagnostic = new vscode.Diagnostic(
                positionMap.get("type") || new vscode.Range(0, 0, 0, 1),
                ValidationHelper.missingRequiredAttributeQuery("coordinates", "shape"),
                vscode.DiagnosticSeverity.Error
            );
    
            if (!ValidationHelper.diagnosticExists(diagnosticsList, newDiagnostic)) {
                diagnosticsList.push(newDiagnostic);
            }
        }
    }

    // TODO: add duplicate check
    // private validateMultipleOccurrences(counter: Map<string, number>, jsonObject: JsonObject, diagnosticsList: vscode.Diagnostic[], positionMap: any): void {
    //     counter.forEach((value, key) => {
    //         if (value > 1) {
    //             diagnosticsList.push(new vscode.Diagnostic(
    //                 positionMap.get(key) || new vscode.Range(0, 0, 0, 1),
    //                 `Attribute '${key}' appears multiple times`,
    //                 vscode.DiagnosticSeverity.Error
    //             ));
    //         }
    //     });
    // }

}
