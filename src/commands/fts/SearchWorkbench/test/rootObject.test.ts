import * as vscode from "vscode";
import { validateDocument } from "../validators/validationUtil";
import { ValidationHelper } from "../validators/validationHelper";

let mockText = "";

jest.mock("vscode", () => ({
    languages: {
        createDiagnosticCollection: jest.fn().mockImplementation(() => {
            const diagnosticsMap = new Map();
            return {
                clear: jest.fn(() => diagnosticsMap.clear()),
                dispose: jest.fn(),
                get: jest.fn((uri) => diagnosticsMap.get(uri.toString())),
                set: jest.fn((uri, diagnostics) =>
                    diagnosticsMap.set(uri.toString(), diagnostics),
                ),
                delete: jest.fn((uri) => diagnosticsMap.delete(uri.toString())),
                forEach: jest.fn((callback) =>
                    diagnosticsMap.forEach(callback),
                ),
            };
        }),
    },
    Uri: {
        parse: jest.fn().mockImplementation((str) => ({
            toString: () => str,
        })),
    },
    workspace: {
        openTextDocument: jest.fn().mockImplementation((uri) => ({
            getText: jest.fn(() => mockText),
            uri: uri,
            positionAt: jest.fn().mockImplementation((index) => {
                return new vscode.Position(
                    Math.floor(index / 100),
                    index % 100,
                );
            }),
        })),
        fs: {
            writeFile: jest.fn(),
        },
    },
    Range: jest.fn().mockImplementation((start, end) => ({
        start: start,
        end: end,
    })),
    Position: jest.fn().mockImplementation((line, character) => ({
        line: line,
        character: character,
    })),
    Diagnostic: jest.fn().mockImplementation((range, message, severity) => ({
        range: range,
        message: message,
        severity: severity,
    })),
    DiagnosticSeverity: {
        Error: 0,
        Warning: 1,
        Information: 2,
        Hint: 3,
    },
}));

const setMockText = (text: any) => {
    mockText = text;
};

describe("Root Object Tests", () => {
    let diagnosticsCollection: vscode.DiagnosticCollection;

    beforeEach(() => {
        diagnosticsCollection =
            vscode.languages.createDiagnosticCollection("testCollection");
    });

    afterEach(() => {
        diagnosticsCollection.dispose();
    });

    test("Valid Hybrid Query", async () => {
        const json = `
            {
                "query": {
                    "query": "description:pool name:pool^5"
                },
                "knn": [
                    {
                        "k": 10,
                        "field": "vector_field",
                        "vector": [0.707106781186548, 0, 0.707106781186548]
                    }
                ],
                "size": 10,
                "from": 0,
                "fields": ["textField"],
                "explain": true,
                "sort": [],
                "includeLocations": false,
                "score": "none",
                "search_after": ["field1Value", "5", "10.033205341869529", "1234"],
                "search_before": ["field1Value", "5", "10.033205341869529", "1234"],
                "limit": 10,
                "offset": 0,
                "collections": ["collection1", "collection2"]
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Missing Query and KNN", async () => {
        const json = `
            {
                "size": 10,
                "from": 0,
                "fields": ["textField"],
                "explain": true,
                "sort": [],
                "includeLocations": false,
                "score": "none",
                "search_after": ["field1Value", "5", "10.033205341869529", "1234"],
                "search_before": ["field1Value", "5", "10.033205341869529", "1234"],
                "limit": 10,
                "offset": 0,
                "collections": ["collection1", "collection2"]
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getRequiredQueryKnnErrorMessage(),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Key", async () => {
        const json = `
            {
                "query": {
                    "query": "description:pool name:pool^5"
                },
                "size": 10,
                "from": 0,
                "fields": ["textField"],
                "explain": true,
                "sort": [],
                "includeLocations": false,
                "score": "none",
                "search_after": ["field1Value", "5", "10.033205341869529", "1234"],
                "search_before": ["field1Value", "5", "10.033205341869529", "1234"],
                "limit": 10,
                "offsets": 0, 
                "collections": ["collection1", "collection2"]
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(1);
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getUnexecptedAttributeAtTopLevel(
                        "offsets",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    // TODO: add duplicate
    // test("Invalid Duplicate Key", async () => {
    //     const json = `
    //         {
    //             "query": {
    //                 "query": "description:pool name:pool^5"
    //             },
    //             "size": 10,
    //             "from": 0,
    //             "fields": ["textField"],
    //             "explain": true,
    //             "sort": [],
    //             "includeLocations": false,
    //             "score": "none",
    //             "search_after": ["field1Value", "5", "10.033205341869529", "1234"],
    //             "search_before": ["field1Value", "5", "10.033205341869529", "1234"],
    //             "limit": 10,
    //             "limit": 10, // Duplicate key should cause validation to fail
    //             "collections": ["collection1", "collection2"]
    //         }
    //     `;

    //     setMockText(json);

    //     await getDiagnosticsForJson(json);
    //     const uri = vscode.Uri.parse('untitled:test.json');
    //     const diagnostics = diagnosticsCollection.get(uri) ?? [];
    //     expect(diagnostics.length).toBe(1);
    //     expect(diagnostics.some(diagnostic => diagnostic.message.includes("Duplicate key 'limit' found"))).toBeTruthy();
    // });

    test("Invalid Types", async () => {
        const json = `
        {
            "query": "",
            "knn": "",
            "ctl": 2,
            "size": "",
            "limit": "",
            "from": "",
            "offset": {},
            "highlight": [],
            "fields": "textField",
            "facets": [],
            "explain": 1,
            "sort": {},
            "includeLocations": 1,
            "score": true,
            "search_after": {},
            "search_before": "",
            "collections": "collection1,collection2"
        }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "json",
                        "query",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "array",
                        "knn",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "json",
                        "ctl",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "number",
                        "size",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "number",
                        "limit",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "number",
                        "from",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "number",
                        "offset",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "json",
                        "highlight",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "array",
                        "fields",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "json",
                        "facets",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "boolean",
                        "explain",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "array",
                        "sort",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "boolean",
                        "includeLocations",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "string",
                        "score",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "array",
                        "search_after",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "array",
                        "search_before",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "array",
                        "collections",
                    ),
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
