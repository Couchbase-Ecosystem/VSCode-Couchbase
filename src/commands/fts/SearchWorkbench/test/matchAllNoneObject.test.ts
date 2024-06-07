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

describe("MatchAllNone Object Tests", () => {
    let diagnosticsCollection: vscode.DiagnosticCollection;

    beforeEach(() => {
        diagnosticsCollection = vscode.languages.createDiagnosticCollection('testCollection');
    });

    afterEach(() => {
        diagnosticsCollection.dispose();
    });

    test("Valid Match All", async () => {
        const json = `
            {
                "query": {
                    "match_all": {}
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse('untitled:test.json');
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Match All", async () => {
        const json = `
            {
                "query": {
                    "match_all": {
                        "field": "test"
                    }
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse('untitled:test.json');
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.some(diagnostic => diagnostic.message.includes(ValidationHelper.getMatchAllNoneNoAttributeErrorMessage("match_all")))).toBeTruthy();

    });

    test("Valid Match None", async () => {
        const json = `
            {
                "query": {
                    "match_none": {}
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse('untitled:test.json');
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Match None", async () => {
        const json = `
            {
                "query": {
                    "match_none": {
                        "field": "test"
                    }
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse('untitled:test.json');
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.some(diagnostic => diagnostic.message.includes(ValidationHelper.getMatchAllNoneNoAttributeErrorMessage("match_none")))).toBeTruthy();
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