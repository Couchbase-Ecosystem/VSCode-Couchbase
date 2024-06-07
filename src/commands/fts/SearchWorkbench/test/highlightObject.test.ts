import * as vscode from 'vscode';
import { validateDocument } from '../validators/validationUtil'; 
import { ValidationHelper } from '../validators/validationHelper';

let mockText = "";

jest.mock('vscode', () => ({
    languages: {
        createDiagnosticCollection: jest.fn().mockImplementation(() => {
            const diagnosticsMap = new Map();
            return {
                clear: jest.fn(() => diagnosticsMap.clear()),
                dispose: jest.fn(),
                get: jest.fn(uri => diagnosticsMap.get(uri.toString())),
                set: jest.fn((uri, diagnostics) => diagnosticsMap.set(uri.toString(), diagnostics)),
                delete: jest.fn(uri => diagnosticsMap.delete(uri.toString())),
                forEach: jest.fn(callback => diagnosticsMap.forEach(callback)),
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
                return new vscode.Position(Math.floor(index / 100), index % 100); 
            }),
        })),
        fs: {
            writeFile: jest.fn(),
        }
    },
    Range: jest.fn().mockImplementation((start, end) => ({
        start: start,
        end: end
    })),
    Position: jest.fn().mockImplementation((line, character) => ({
        line: line,
        character: character
    })),
    Diagnostic: jest.fn().mockImplementation((range, message, severity) => ({
        range: range,
        message: message,
        severity: severity
    })),
    DiagnosticSeverity: {
        Error: 0,  
        Warning: 1,
        Information: 2,
        Hint: 3
    }
}));

const setMockText = (text:any) => {
    mockText = text;
};

describe("Highlight Object Tests", () => {
    let diagnosticsCollection: vscode.DiagnosticCollection;

    beforeEach(() => {
        diagnosticsCollection = vscode.languages.createDiagnosticCollection('testCollection');
    });

    afterEach(() => {
        diagnosticsCollection.dispose();
    });

    test("Valid Highlight", async () => {
        const json = `
            {
                "query": {
                    "query": "description:pool name:pool^5"
                },
                "highlight": {
                    "style": "html",
                    "fields": ["textField"]
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse('untitled:test.json');
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Valid Empty Highlight", async () => {
        const json = `
            {
                "query": {
                    "query": "description:pool name:pool^5"
                },
                "highlight": {}
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse('untitled:test.json');
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    // TODO: add duplicate
    // test("Duplicate Values", async () => {
    //     const json = `
    //         {
    //             "query": {
    //                 "query": "description:pool name:pool^5"
    //             },
    //             "highlight": {
    //                 "style": "html",
    //                 "style": "html",
    //                 "fields": ["textField"],
    //                 "fields": ["textField"]
    //             }
    //         }
    //     `;

    //     setMockText(json);

    //     await getDiagnosticsForJson(json);
    //     const uri = vscode.Uri.parse('untitled:test.json');
    //     const diagnostics = diagnosticsCollection.get(uri) ?? [];
    //     expect(diagnostics.length).toBe(2);
    //     expect(diagnostics.some(diagnostic => diagnostic.message.includes("Duplicate key 'style'"))).toBeTruthy();
    //     expect(diagnostics.some(diagnostic => diagnostic.message.includes("Duplicate key 'fields'"))).toBeTruthy();
    // });

    test("Invalid Field Name", async () => {
        const json = `
            {
                "query": {
                    "query": "description:pool name:pool^5"
                },
                "highlight": {
                    "style": "ansi",
                    "fielsd": ["textField"]
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse('untitled:test.json');
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.some(diagnostic => diagnostic.message.includes(ValidationHelper.getUnexpectedAttributeMessage("fielsd", "highlight")))).toBeTruthy();
    });

    test("Invalid Attribute Types", async () => {
        const json = `
            {
                "query": {
                    "query": "description:pool name:pool^5"
                },
                "highlight": {
                    "style": 2,
                    "fields": "textField"
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse('untitled:test.json');
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.some(diagnostic => diagnostic.message.includes(ValidationHelper.getExpectedDataTypeErrorMessage("string", "style")))).toBeTruthy();
        expect(diagnostics.some(diagnostic => diagnostic.message.includes(ValidationHelper.getExpectedDataTypeErrorMessage("array", "fields")))).toBeTruthy();
    });

    test("Invalid Style Value", async () => {
        const json = `
            {
                "query": {
                    "query": "description:pool name:pool^5"
                },
                "highlight": {
                    "style": "ansiml",
                    "fields": ["textField"]
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse('untitled:test.json');
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.some(diagnostic => diagnostic.message.includes(ValidationHelper.getStyleValuesErrorMessage()))).toBeTruthy();
    });


async function getDiagnosticsForJson(jsonText: string) {
    try {
        const uri = vscode.Uri.parse('untitled:test.json');
        await vscode.workspace.fs.writeFile(uri, Buffer.from(jsonText));
        const document = await vscode.workspace.openTextDocument(uri);
        validateDocument(document, diagnosticsCollection);
    } catch (error) {
        console.error("Error during testing:", error);
    }
}

}); 