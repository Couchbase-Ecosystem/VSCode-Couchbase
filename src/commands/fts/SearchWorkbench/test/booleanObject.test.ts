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

describe("CBSBooleanInspection Tests", () => {
    let diagnosticsCollection: vscode.DiagnosticCollection;

    beforeEach(() => {
        diagnosticsCollection =
            vscode.languages.createDiagnosticCollection("testCollection");
    });

    afterEach(() => {
        diagnosticsCollection.dispose();
    });

    test("Valid Must", async () => {
        const json = `{
            "query": {
                 "must": {
                     "conjuncts": [
                         {
                             "field": "reviews.content",
                             "match": "location"
                         },
                         {
                             "field": "reviews.content",
                             "match_phrase": "nice view"
                         }
                     ]
                 }
             }
        }`;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        expect(diagnosticsCollection.get(uri)?.length).toBe(0);
    });

    test("Invalid Must Disjuncts", async () => {
        const json = `                {
            "query":{
                 "must":{
                     "disjuncts":[
                         {
                             "field": "reviews.content",
                             "match": "location"
                         },
                         {
                             "field":"reviews.content",
                             "match_phrase": "nice view"
                         }
                     ]
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
                    ValidationHelper.getMustConjunctsErrorMessage(),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Should", async () => {
        const json = `                {
            "query":{
                  "should":{
                      "disjuncts":[
                          {
                              "field": "free_parking",
                              "bool": true
                          },
                          {
                              "field": "free_internet",
                              "bool": true
                          }
                      ],
                      "min": 1
                  }
              }
        }`;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        expect(diagnosticsCollection.get(uri)?.length).toBe(0);
    });

    test("Invalid Should", async () => {
        const json = `                {
            "query":{
                  "should":{
                      "conjuncts":[
                          {
                              "field": "free_parking",
                              "bool": true
                          },
                          {
                              "field": "free_internet",
                              "bool": true
                          }
                      ],
                      "min": 1
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
                    ValidationHelper.getShouldErrorMessage(),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Must", async () => {
        const json = `                 {
            "query":{
                 "must":{
                     "conjuncts":[
                         {
                             "field": "reviews.content",
                             "match": "location"
                         },
                         {
                             "field":"reviews.content",
                             "match_phrase": "nice view"
                         }
                     ],
                     "min":5
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
                    ValidationHelper.getMustConjunctsErrorMessage(),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Must not", async () => {
        const json = `                 {
            "query":{
                  "must_not":{
                      "disjuncts":[
                          {
                              "field": "free_breakfast",
                              "bool": false
                          },
                          {
                              "field": "ratings.Cleanliness",
                              "min": 1,
                              "max": 3
                          }
                      ]
                  }
              }
        }`;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        expect(diagnosticsCollection.get(uri)?.length).toBe(0);
    });

    test("Invalid Must Not Conjunct", async () => {
        const json = `                 {
            "query":{
                 "must_not":{
                     "conjuncts":[
                         {
                             "field": "reviews.content",
                             "match": "location"
                         },
                         {
                             "field":"reviews.content",
                             "match_phrase": "nice view"
                         }
                     ]
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
                    ValidationHelper.getMustNotDisjunctsErrorMessage(),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Must Not Min", async () => {
        const json = `                {
            "query":{
                  "must_not":{
                      "disjuncts":[
                          {
                              "field": "free_breakfast",
                              "bool": false
                          },
                          {
                              "field": "ratings.Cleanliness",
                              "min": 1,
                              "max": 3
                          }
                      ],
                      "min": 1
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
                    ValidationHelper.getMustNotDisjunctsErrorMessage(),
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
