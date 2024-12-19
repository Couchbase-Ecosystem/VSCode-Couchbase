import * as vscode from "vscode";
import { validateDocument } from "../validators/validationUtil";
import { mock } from "node:test";
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

describe("Ctl Consistency Object Tests", () => {
    let diagnosticsCollection: vscode.DiagnosticCollection;

    beforeEach(() => {
        diagnosticsCollection =
            vscode.languages.createDiagnosticCollection("testCollection");
    });

    afterEach(() => {
        diagnosticsCollection.dispose();
    });

    test("Valid Ctl", async () => {
        const json = `                {
            "query": {
                 "query": "description:pool name:pool^5"
            },
            "ctl": {
                    "timeout": 10000,
                    "consistency": {
                        "vectors": {
                            "searchIndexName": {
                                "607/205096593892159": 2,
                                "640/298739127912798": 4
                            }
                        },
                        "level": "at_plus",
                        "results": "complete"
                    }
            }
        }`;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        expect(diagnosticsCollection.get(uri)?.length).toBe(0);
    });

    test("Valid - Missing Timeout", async () => {
        const json = `                 {
            "query": {
                 "query": "description:pool name:pool^5"
            },
            "ctl": {
                    "consistency": {
                        "vectors": {
                            "searchIndexName": {
                                "607/205096593892159": 2,
                                "640/298739127912798": 4
                            }
                        },
                        "level": "at_plus",
                        "results": "complete"
                    }
            }
        }`;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        expect(diagnosticsCollection.get(uri)?.length).toBe(0);
    });

    test("Invalid Consistency", async () => {
        const json = `                {
            "query": {
                 "query": "description:pool name:pool^5"
            },
            "ctl": {
                   
            }
        }`;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getSingleOccurrenceMessage(
                        "consistency",
                        "ctl",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Consistency Types", async () => {
        const json = `                  {
            "query": {
                 "query": "description:pool name:pool^5"
            },
            "ctl": {
                    "timeout": 10000,
                    "consistency": {
                        "vectors": "",
                        "level": 1,
                        "results": 1
                    }
            }
            
        }`;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "json",
                        "vectors",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "string",
                        "level",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "string",
                        "results",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid CTL Object Types", async () => {
        const json = `
            {
                "query": {
                    "query": "description:pool name:pool^5"
                },
                "ctl": {
                        "timeout": "",
                        "consistency": ""
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
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "number",
                        "timeout",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "json",
                        "consistency",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Consistency", async () => {
        const json = `
            {
                "query": {
                    "query": "description:pool name:pool^5"
                },
                "ctl": {
                    "timeout": 10000,
                    "consistency": {
                        "vectors": {
                            "searchIndexName": {
                                "607/205096593892159": 2,
                                "640/298739127912798": 4
                            }
                        },
                        "level": "at_plus",
                        "results": "complete"
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

    test("Missing Level", async () => {
        const json = `
            {
                "query": {
                    "query": "description:pool name:pool^5"
                },
                "ctl": {
                    "timeout": 10000,
                    "consistency": {
                        "vectors": {
                            "searchIndexName": {
                                "607/205096593892159": 2,
                                "640/298739127912798": 4
                            }
                        },
                        "results": "complete"
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
                    ValidationHelper.getMissingAttributeMessage(
                        "level",
                        "consistency",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Level Not Bounded", async () => {
        const json = `
            {
                "query": {
                    "query": "description:pool name:pool^5"
                },
                "ctl": {
                    "timeout": 10000,
                    "consistency": {
                        "level": "not_bounded",
                        "results": "complete"
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

    test("Missing Vector", async () => {
        const json = `
            {
                "query": {
                    "query": "description:pool name:pool^5"
                },
                "ctl": {
                    "timeout": 10000,
                    "consistency": {
                        "level": "at_plus"
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
                    ValidationHelper.getMissingAttributeMessage(
                        "vectors",
                        "consistency",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Result", async () => {
        const json = `
            {
                "query": {
                    "query": "description:pool name:pool^5"
                },
                "ctl": {
                    "timeout": 10000,
                    "consistency": {
                        "vectors": {
                            "searchIndexName": {
                                "607/205096593892159": 2,
                                "640/298739127912798": 4
                            }
                        },
                        "level": "at_plus",
                        "results": "invalid"
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
                    ValidationHelper.getResultErrorMessage(),
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
