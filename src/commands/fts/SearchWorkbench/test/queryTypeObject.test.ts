import * as vscode from "vscode";
import { validateDocument } from "../validators/validationUtil";
import { ValidationHelper } from "../validators/validationHelper";
import { QueryTypeObjectValidator } from "../validators/queryTypeObjectValidator";

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

describe("Query Type Object Tests", () => {
    let diagnosticsCollection: vscode.DiagnosticCollection;

    beforeEach(() => {
        diagnosticsCollection =
            vscode.languages.createDiagnosticCollection("testCollection");
    });

    afterEach(() => {
        diagnosticsCollection.dispose();
    });

    test("Valid Match", async () => {
        const json = `
            {
                "query": {
                    "match": "best great",
                    "field": "reviews.content",
                    "analyzer": "standard",
                    "operator": "or"
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Match Types", async () => {
        const json = `
            {
                "query": {
                    "match": [],
                    "field": [],
                    "analyzer": 2,
                    "operator": [],
                    "fuzziness": "2",
                    "prefix_length": "4"
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
                        "string",
                        "match",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "string",
                        "field",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "string",
                        "analyzer",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "string",
                        "operator",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "number",
                        "fuzziness",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "number",
                        "prefix_length",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Valid Match Operator", async () => {
        const json = `
            {
                "query": {
                    "match": "best great",
                    "field": "reviews.content",
                    "analyzer": "standard",
                    "operator": "not"
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
                    QueryTypeObjectValidator.invalidOperatorMessage(),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Match Without Operator", async () => {
        const json = `
            {
                "query": {
                    "match": "best great",
                    "field": "reviews.content",
                    "analyzer": "standard"
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
                    QueryTypeObjectValidator.matchWithSpaceMessage(),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Match", async () => {
        const json = `
            {
                "query": {
                    "match": "best",
                    "field": "reviews.content",
                    "analyzer": "standard",
                    "min": 2
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
                    ValidationHelper.getUnexpectedAttributeMessageForQuery(
                        "min",
                        "match",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Valid Numeric Range", async () => {
        const json = `
            {
                "query": {
                    "min": 2,
                    "match": "best",
                    "field": "reviews.content"                        
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
                    ValidationHelper.getUnexpectedAttributeMessageForQuery(
                        "match",
                        "numeric range",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Match Phrase", async () => {
        const json = `
            {
                "query": {
                    "match_phrase": "best great",
                    "field": "reviews.content",
                    "analyzer": "standard",
                    "operator": "or",
                    "fuzziness": 2
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Match Phrase", async () => {
        const json = `
            {
                "query": {
                    "match_phrase": [],
                    "field": "reviews.content",
                    "analyzer": "standard",
                    "operator": "or",
                    "fuzziness": 2
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
                        "string",
                        "match_phrase",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Boolean", async () => {
        const json = `
            {
                "query": {
                    "field": "pets_ok",
                    "bool": true
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Boolean", async () => {
        const json = `
            {
                "query": {
                    "field": "pets_ok",
                    "bool": "true"
                }
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
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "boolean",
                        "bool",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Prefix", async () => {
        const json = `
            {
                "query": {
                    "prefix": "inter",
                    "field": "reviews.content"
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Prefix", async () => {
        const json = `
            {
                "query": {
                    "prefix": ["inter"],
                    "field": "reviews.content"
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
                        "string",
                        "prefix",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Prefix With Fuzziness", async () => {
        const json = `
            {
                "query": {
                    "prefix": "inter",
                    "field": "reviews.content",
                    "fuzziness": 2
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
                    ValidationHelper.getUnexpectedAttributeMessageForQuery(
                        "fuzziness",
                        "prefix",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Regex", async () => {
        const json = `
            {
                "query": {
                    "regexp": "plan.+",
                    "field": "reviews.content"
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Regex", async () => {
        const json = `
            {
                "query": {
                    "regexp": ["plan.+"],
                    "field": "reviews.content"
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
                        "string",
                        "regexp",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Term", async () => {
        const json = `
            {
                "query": {
                    "term": "interest",
                    "field": "reviews.content",
                    "fuzziness": 2
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Term Analyzer", async () => {
        const json = `
            {
                "query": {
                    "term": "interest",
                    "field": "reviews.content",
                    "fuzziness": 2,
                    "analyzer": "standard"
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
                    ValidationHelper.getUnexpectedAttributeMessageForQuery(
                        "analyzer",
                        "term",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Term", async () => {
        const json = `
            {
                "query": {
                    "term": ["interest"],
                    "field": "reviews.content",
                    "fuzziness": 2
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
                        "string",
                        "term",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Terms", async () => {
        const json = `
            {
                "query": {
                    "terms": ["nice", "view"],
                    "field": "reviews.content"
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Terms Analyzer", async () => {
        const json = `
            {
                "query": {
                    "terms": ["nice", "view"],
                    "field": "reviews.content",
                    "analyzer": "standard"
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
                    ValidationHelper.getUnexpectedAttributeMessageForQuery(
                        "analyzer",
                        "terms",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Terms", async () => {
        const json = `
            {
                "query": {
                    "terms": "interest",
                    "field": "reviews.content"
                }
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
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "array",
                        "terms",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Wildcard", async () => {
        const json = `
            {
                "query": {
                    "wildcard": "inter*",
                    "field": "reviews.content"
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Wildcard", async () => {
        const json = `
            {
                "query": {
                    "wildcard": ["inter*"],
                    "field": "reviews.content"
                }
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
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "string",
                        "wildcard",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid CIDR", async () => {
        const json = `
            {
                "query": {
                    "cidr": "2.7.13.0/24",
                    "field": "ipv4"
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid CIDR", async () => {
        const json = `
            {
                "query": {
                    "cidr": ["2.7.13.0/24"],
                    "field": "ipv4"
                }
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
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "string",
                        "cidr",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Numeric Range", async () => {
        const json = `
            {
                "query": {
                    "min": 3,
                    "max": 5,
                    "inclusive_min": false,
                    "inclusive_max": true,
                    "field": "reviews.ratings.Cleanliness"
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid MinMax", async () => {
        const json = `
            {
                "query": {
                    "inclusive_min": false,
                    "inclusive_max": true,
                    "field": "reviews.ratings.Cleanliness"
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
                    QueryTypeObjectValidator.minOrMaxRequiredMessage(),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Range", async () => {
        const json = `
            {
                "query": {
                    "min": 3,
                    "max": 5,
                    "inclusive_min": "false",
                    "inclusive_max": "true",
                    "field": "reviews.ratings.Cleanliness"
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
                        "boolean",
                        "inclusive_min",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "boolean",
                        "inclusive_max",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Date Range", async () => {
        const json = `
            {
                "query": {
                    "start": "2001-10-09T10:20:30-08:00",
                    "end": "2016-10-31",
                    "inclusive_start": false,
                    "inclusive_end": false,
                    "field": "reviews.date"
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Date Range", async () => {
        const json = `
            {
                "query": {
                    "start": 111111111111,
                    "end": 111111111111,
                    "inclusive_start": "false",
                    "inclusive_end": "false",
                    "field": "reviews.date"
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
                        "string",
                        "start",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "string",
                        "end",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "boolean",
                        "inclusive_start",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "boolean",
                        "inclusive_end",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Conjuncts", async () => {
        const json = `
            {
                "query": {
                    "conjuncts": [
                        {
                            "field": "reviews.date",
                            "start": "2001-10-09",
                            "end": "2016-10-31",
                            "inclusive_start": false,
                            "inclusive_end": false
                        },
                        {
                            "field": "description",
                            "match": "pool"
                        }
                    ]
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Conjuncts Type", async () => {
        const json = `
            {
                "query": {
                    "conjuncts": {
                        "field": "reviews.date",
                        "start": "2001-10-09",
                        "end": "2016-10-31",
                        "inclusive_start": false,
                        "inclusive_end": false
                    }
                }
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
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "array",
                        "conjuncts",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Disjuncts Type", async () => {
        const json = `
            {
                "query": {
                    "disjuncts": {
                        "field": "reviews.date",
                        "start": "2001-10-09",
                        "end": "2016-10-31",
                        "inclusive_start": false,
                        "inclusive_end": false
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
                    ValidationHelper.getExpectedDataTypeErrorMessage(
                        "array",
                        "disjuncts",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Disjuncts", async () => {
        const json = `
            {
                "query": {
                    "disjuncts": [
                        {
                            "field": "free_parking",
                            "bool": true
                        },
                        {
                            "field": "checkin",
                            "match": "1PM"
                        }
                    ],
                    "min": 1
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Disjuncts", async () => {
        const json = `
            {
                "query": {
                    "disjuncts": [
                        {
                            "field": "free_parking",
                            "bool": true
                        },
                        {
                            "field": "checkin",
                            "match": "1PM"
                        }
                    ],
                    "min": 1,
                    "field": "pets_ok",
                    "bool": true
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
                    QueryTypeObjectValidator.getFieldNotAllowedOnCompound(),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Distance Object", async () => {
        const json = `
            {
                "query": {
                    "location": {
                        "lon": -2.235143,
                        "lat": 53.482358
                    },
                    "distance": "100mi",
                    "field": "geo"
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Distance Object Missing Distance", async () => {
        const json = `
            {
                "query": {
                    "location": {
                        "lon": -2.235143,
                        "lat": 53.482358
                    },
                    "field": "geo"
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
                        "distance",
                        "distance radius",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Missing Location", async () => {
        const json = `
            {
                "query": {
                    "distance": "100mi",
                    "field": "geo"
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
                        "location",
                        "distance radius",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Distance Array Location", async () => {
        const json = `
            {
                "query": {
                    "location": [-2.235143, 53.482358],
                    "distance": "100mi",
                    "field": "geo"
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Location Object", async () => {
        const json = `
            {
                "query": {
                    "location": {
                        "lon": -2.235143
                    },
                    "distance": "100mi",
                    "field": "geo"
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
                    ValidationHelper.getExpectedObjectPropertiesMessage(
                        "location",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Distance Attribute", async () => {
        const json = `
            {
                "query": {
                    "location": {
                        "lon": -2.235143,
                        "lat": 53.482358
                    },
                    "distance": "100mi",
                    "field": "geo",
                    "fuzziness": 3
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
                    ValidationHelper.getUnexpectedAttributeMessageForQuery(
                        "fuzziness",
                        "distance radius",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Distance Value", async () => {
        const json = `
            {
                "query": {
                    "location": {
                        "lon": -2.235143,
                        "lat": 53.482358
                    },
                    "distance": 100,
                    "field": "geo"
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
                        "string",
                        "distance",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Distance Unit", async () => {
        const json = `
            {
                "query": {
                    "location": {
                        "lon": -2.235143,
                        "lat": 53.482358
                    },
                    "distance": "100",
                    "field": "geo"
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
                        "distance",
                        validUnits,
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Rectangle", async () => {
        const json = `
            {
                "query": {
                    "top_left": [-2.235143, 53.482358],
                    "bottom_right": {
                        "lon": 28.955043,
                        "lat": 40.991862
                    },
                    "field": "geo"
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Rectangle Missing Top Left", async () => {
        const json = `
            {
                "query": {
                    "bottom_right": {
                        "lon": 28.955043,
                        "lat": 40.991862
                    },
                    "field": "geo"
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
                        "top_left",
                        "rectangle based",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Rectangle Missing Bottom Right", async () => {
        const json = `
            {
                "query": {
                    "top_left": [-2.235143, 53.482358],
                    "field": "geo"
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
                        "bottom_right",
                        "rectangle based",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Valid Polygon", async () => {
        const json = `
            {
                "query": {
                    "field": "geo",
                    "polygon_points": [
                        "37.79393211306212,-122.44234633404847",
                        "37.77995881733997,-122.43977141339417",
                        "37.788031092020155,-122.42925715405579",
                        "37.79026946582319,-122.41149020154114",
                        "37.79571192027403,-122.40735054016113",
                        "37.79393211306212,-122.44234633404847"
                    ]
                }
            }
        `;

        setMockText(json);

        await getDiagnosticsForJson(json);
        const uri = vscode.Uri.parse("untitled:test.json");
        const diagnostics = diagnosticsCollection.get(uri) ?? [];
        expect(diagnostics.length).toBe(0);
    });

    test("Invalid Polygon", async () => {
        const json = `
            {
                "query": {
                    "field": "geo",
                    "polygon_points": {}
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
                        "array",
                        "polygon_points",
                    ),
                ),
            ),
        ).toBeTruthy();
    });

    test("Invalid Polygon Array", async () => {
        const json = `
            {
                "query": {
                    "field": "geo",
                    "polygon_points": [
                        "37.79393211306212/-122.44234633404847",
                        "37.77995881733997|-122.43977141339417",
                        "37.788031092020155;-122.42925715405579"
                    ]
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
                    ValidationHelper.getExpectedLatLonMessage(
                        "polygon_points[0]",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedLatLonMessage(
                        "polygon_points[1]",
                    ),
                ),
            ),
        ).toBeTruthy();
        expect(
            diagnostics.some((diagnostic) =>
                diagnostic.message.includes(
                    ValidationHelper.getExpectedLatLonMessage(
                        "polygon_points[2]",
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
