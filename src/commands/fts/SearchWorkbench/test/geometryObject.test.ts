import * as vscode from "vscode";
import { validateDocument } from "../validators/validationUtil";
import { mock } from "node:test";
import { ValidationHelper } from "../validators/validationHelper";

let mockText = "";

jest.mock("vscode", () => {
    // Shared mock from __mocks__/vscode.js, with documents returning this test's mockText
    const shared = jest.requireActual("../../../../../__mocks__/vscode");
    return {
        ...shared,
        workspace: {
            ...shared.workspace,
            openTextDocument: jest.fn().mockImplementation((uri) => ({
                getText: jest.fn(() => mockText),
                uri: uri,
                positionAt: jest.fn().mockImplementation((index) => new shared.Position(
                    Math.floor(index / 100),
                    index % 100,
                )),
            })),
        },
    };
});

const setMockText = (text: any) => {
    mockText = text;
};

describe("Geometry Object Tests", () => {
    let diagnosticsCollection: vscode.DiagnosticCollection;

    beforeEach(() => {
        diagnosticsCollection =
            vscode.languages.createDiagnosticCollection("testCollection");
    });

    afterEach(() => {
        diagnosticsCollection.dispose();
    });

    test("Valid Point JSON", async () => {
        const json = `
            {
                "query": {
                    "field": "geojson",
                    "geometry": {
                        "shape": {
                            "type": "Point",
                            "coordinates": [0.47482593026924746, 51.31232878073189]
                        },
                        "relation": "intersects"
                    }
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Shape Missing Coordinate", async () => {
        const json = `
            {
                "query": {
                    "field": "geojson",
                    "geometry": {
                        "shape": {
                            "type": "Point"
                        },
                        "relation": "intersects"
                    }
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.missingRequiredAttributeQuery(
                        "coordinates",
                        "shape",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Shape Missing Type", async () => {
        const json = `
            {
                "query": {
                    "field": "geojson",
                    "geometry": {
                        "shape": {
                            "coordinates": [0.47482593026924746, 51.31232878073189]
                        },
                        "relation": "intersects"
                    }
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.missingRequiredAttributeQuery(
                        "type",
                        "shape",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Shape Missing Geometries", async () => {
        const json = `
            {
                "query": {
                    "field": "geojson",
                    "geometry": {
                        "shape": {
                            "type": "GeometryCollection"
                        },
                        "relation": "intersects"
                    }
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.missingRequiredAttributeQuery(
                        "geometries",
                        "shape",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Shape Missing Radius", async () => {
        const json = `
            {
                "query": {
                    "field": "geojson",
                    "geometry": {
                        "shape": {
                            "type": "Circle",
                            "coordinates": [-2.2450285424707204, 53.48503270828377]
                        },
                        "relation": "intersects"
                    }
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.missingRequiredAttributeQuery(
                        "radius",
                        "shape",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Circle", async () => {
        const json = `
            {
                "query": {
                    "field": "geojson",
                    "geometry": {
                        "shape": {
                            "coordinates": [-2.2450285424707204, 53.48503270828377],
                            "type": "Circle",
                            "radius": "100mi"
                        },
                        "relation": "within"
                    }
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Shape Invalid Radius", async () => {
        const json = `
            {
                "query": {
                    "field": "geojson",
                    "geometry": {
                        "shape": {
                            "type": "Circle",
                            "coordinates": [-2.2450285424707204, 53.48503270828377],
                            "radius": "100"
                        },
                        "relation": "intersects"
                    }
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        const validUnits = [
            "mm",
            "cm",
            "in",
            "yd",
            "ft",
            "km",
            "mi",
            "nm",
            "m",
        ];
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getInvalidDistanceUnitErrorMessage(
                        "radius",
                        validUnits,
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Relation Value", async () => {
        const json = `
            {
                "query": {
                    "field": "geojson",
                    "geometry": {
                        "shape": {
                            "type": "Point",
                            "coordinates": [0.47482593026924746, 51.31232878073189]
                        },
                        "relation": "union"
                    }
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getRelationErrorMessage(),
                ),
            ),
        ).toBeTruthy();
    });

    async function getDiagnosticsForJson(jsonText: string) {
        try {
            const uri = vscode.Uri.parse("untitled:test.json");
            await vscode.workspace.fs.writeFile(uri, Buffer.from(jsonText));
            const document = await vscode.workspace.openTextDocument(uri);
            validateDocument(document, diagnosticsCollection);
        } catch (error) {
            console.error("Error during testing:", error);
        }
    }
});
