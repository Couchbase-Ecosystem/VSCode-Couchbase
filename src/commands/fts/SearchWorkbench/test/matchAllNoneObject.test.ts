import * as vscode from "vscode";
import { validateDocument } from "../validators/validationUtil";
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

describe("MatchAllNone Object Tests", () => {
    let diagnosticsCollection: vscode.DiagnosticCollection;

    beforeEach(() => {
        diagnosticsCollection =
            vscode.languages.createDiagnosticCollection("testCollection");
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
        const uri = vscode.Uri.parse("untitled:test.json");
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
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getMatchAllNoneNoAttributeErrorMessage(
                        "match_all",
                    ),
                ),
            ),
        ).toBeTruthy();
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
        const uri = vscode.Uri.parse("untitled:test.json");
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
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getMatchAllNoneNoAttributeErrorMessage(
                        "match_none",
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
