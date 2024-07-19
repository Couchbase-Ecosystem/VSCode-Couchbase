import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { AutocompleteVisitor } from "../../commands/fts/SearchWorkbench/contributor/autoCompleteVisitor";
import { queryCbsContributor } from "../../commands/fts/SearchWorkbench/contributor/queryCbsContributor";
import { locationCbsContributor } from "../../commands/fts/SearchWorkbench/contributor/locationCbsContributor";

suite("CBSQueryCodeCompletion Test Suite", () => {
    let autocompleteVisitor: AutocompleteVisitor;
    let tempDir: string;

    setup(async () => {
        autocompleteVisitor = new AutocompleteVisitor();
        tempDir = await fs.promises.mkdtemp(
            path.join(os.tmpdir(), "vscode-test-"),
        );
    });

    teardown(async () => {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
    });

    const getCompletions = async (content: string): Promise<string[]> => {
        const tempFile = path.join(tempDir, "test.json");
        await fs.promises.writeFile(tempFile, content);

        const uri = vscode.Uri.file(tempFile);
        const document = await vscode.workspace.openTextDocument(uri);

        const caretIndex = content.indexOf("<caret>");
        const position = document.positionAt(caretIndex);
        const completionItems =
            await autocompleteVisitor.getAutoCompleteContributor(
                document,
                position,
            );
        return completionItems.map((item) => item.label as string);
    };

    test("query completion", async () => {
        const content = `{
        "query": {
          "<caret>"
        }
      }`;
        const completionResults = await getCompletions(content);

        assert.notStrictEqual(completionResults, null, "No completions found");
        for (const keyword of queryCbsContributor.allQueryKeys) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("query completion conjuncts", async () => {
        const content = `{
        "query": {
          "conjuncts":[
            {
              "<caret>"
            }
          ]
        }
      }`;
        const completionResults = await getCompletions(content);

        assert.notStrictEqual(completionResults, null, "No completions found");
        for (const keyword of queryCbsContributor.allQueryKeys) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("query completion disjuncts", async () => {
        const content = `{
        "query": {
          "disjuncts":[
            {
              "<caret>"
            }
          ]
        }
      }`;
        const completionResults = await getCompletions(content);

        assert.notStrictEqual(completionResults, null, "No completions found");
        for (const keyword of queryCbsContributor.allQueryKeys) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("query completion disjuncts no recommendation", async () => {
        const content = `{
        "query": {
          "disjuncts":[
            "<caret>"
          ]
        }
      }`;
        const completionResults = await getCompletions(content);
        assert.strictEqual(completionResults.length, 0);
    });

    test("query completion conjuncts no recommendation", async () => {
        const content = `{
        "query": {
          "conjuncts":[
            "<caret>"
          ]
        }
      }`;
        const completionResults = await getCompletions(content);
        assert.strictEqual(completionResults.length, 0);
    });

    test("query completion empty", async () => {
        const content = `{
        "query": {
          "query": "",
          <caret>
        }
      }`;
        const completionResults = await getCompletions(content);
        assert.strictEqual(completionResults.length, 0);
    });

    test("match", async () => {
        const content = `{
        "query": {
          "match":"",
          "<caret>"
        }
      }`;
        const completionResults = await getCompletions(content);
        const expected = [
            "field",
            "analyzer",
            "operator",
            "boost",
            "fuzziness",
            "prefix_length",
        ];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("operator", async () => {
        const content = `{
        "query": {
          "operator": "or",
          "<caret>"
        }
      }`;
        const completionResults = await getCompletions(content);
        const expected = [
            "field",
            "analyzer",
            "boost",
            "fuzziness",
            "prefix_length",
        ];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("bool", async () => {
        const content = `{
        "query": {
          "bool": true
          "<caret>"
        }
      }`;
        const completionResults = await getCompletions(content);
        const expected = ["field", "boost"];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("prefix", async () => {
        const content = `{
        "query": {
          "prefix": ""
          "<caret>"
        }
      }`;
        const completionResults = await getCompletions(content);
        const expected = ["field", "boost"];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("regex", async () => {
        const content = `{
        "query": {
          "regexp": ""
          "<caret>"
        }
      }`;
        const completionResults = await getCompletions(content);
        const expected = ["field", "boost"];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("term", async () => {
        const content = `{
        "query": {
          "term": ""
          "<caret>"
        }
      }`;
        const completionResults = await getCompletions(content);
        const expected = ["field", "boost", "fuzziness"];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("terms", async () => {
        const content = `{
        "query": {
          "terms": []
          "<caret>"
        }
      }`;
        const completionResults = await getCompletions(content);
        const expected = ["field", "boost"];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("wildcard", async () => {
        const content = `{
        "query": {
          "wildcard": "*"
          "<caret>"
        }
      }`;
        const completionResults = await getCompletions(content);
        const expected = ["field", "boost"];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("numeric min", async () => {
        const content = `{
        "query": {
          "min": 3,
          "<caret>"
        }
      }`;
        const completionResults = await getCompletions(content);
        const expected = [
            "max",
            "inclusive_min",
            "inclusive_max",
            "field",
            "boost",
        ];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("numeric min max", async () => {
        const content = `{
        "query": {
          "min": 3,
          "min": 10,
          "<caret>"
        }
      }`;
        const completionResults = await getCompletions(content);
        const expected = ["inclusive_min", "inclusive_max", "field", "boost"];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("date start", async () => {
        const content = `{
        "query": {
          "start": "2001-10-09T10:20:30-08:00",
          "<caret>"
        }
      }`;
        const completionResults = await getCompletions(content);
        const expected = [
            "end",
            "inclusive_start",
            "inclusive_end",
            "field",
            "boost",
        ];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("date start inclusive end", async () => {
        const content = `{
        "query": {
          "start": "2001-10-09T10:20:30-08:00",
          "inclusive_end": false,
          "<caret>"
        }
      }`;
        const completionResults = await getCompletions(content);
        const expected = ["end", "inclusive_start", "field", "boost"];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("date inclusive end", async () => {
        const content = `{
        "query": {
          "inclusive_start": false,
          "<caret>"
        }
      }`;
        const completionResults = await getCompletions(content);
        const expected = ["start", "end", "inclusive_end", "field", "boost"];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("distance", async () => {
        const content = `{
        "query": {
           "location": {
             "lon": -2.235143,
             "lat": 53.482358
           },
            "<caret>"
       }
      }`;
        const completionResults = await getCompletions(content);
        const expected = ["distance", "field", "boost"];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("rectangle", async () => {
        const content = `{
        "query": {
              "top_left": [-2.235143, 53.482358],
              "<caret>"
          }
      }`;
        const completionResults = await getCompletions(content);
        const expected = ["bottom_right", "field", "boost"];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("polygon", async () => {
        const content = `{
        "query": {
              "polygon_points": [
                 "37.79393211306212,-122.44234633404847",
                 "37.77995881733997,-122.43977141339417",
                 "37.788031092020155,-122.42925715405579",
                 "37.79026946582319,-122.41149020154114",
                 "37.79571192027403,-122.40735054016113",
                 "37.79393211306212,-122.44234633404847"
               ],
              "<caret>"
          }
      }`;
        const completionResults = await getCompletions(content);
        const expected = ["field", "boost"];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("must", async () => {
        const content = `{
         "query":{
             "must":{
                 "<caret>"
             }
         }
     }`;
        const completionResults = await getCompletions(content);
        assert.notStrictEqual(completionResults, null, "No completions found");
        assert.ok(
            completionResults.includes("conjuncts"),
            "Expected completion 'conjuncts' not found",
        );
    });

    test("must not", async () => {
        const content = `{
         "query":{
             "must_not":{
                 "<caret>"
             }
         }
     }`;
        const completionResults = await getCompletions(content);
        assert.notStrictEqual(completionResults, null, "No completions found");
        assert.ok(
            completionResults.includes("disjuncts"),
            "Expected completion 'disjuncts' not found",
        );
    });

    test("should", async () => {
        const content = `{
         "query":{
             "disjuncts":{
                 "<caret>"
             }
         }
     }`;
        const completionResults = await getCompletions(content);
        assert.notStrictEqual(completionResults, null, "No completions found");
        assert.ok(
            completionResults.includes("disjuncts"),
            "Expected completion 'disjuncts' not found",
        );
    });

    test("top left", async () => {
        const content = `{
        "query": {
            "top_left": {"<caret>"},
            "bottom_right": {
              "lon": 28.955043,
              "lat": 40.991862
            },
            "field": "geo"
        }
      }`;
        const completionResults = await getCompletions(content);
        assert.notStrictEqual(completionResults, null, "No completions found");
        for (const keyword of locationCbsContributor.keys) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("bottom right", async () => {
        const content = `{
        "query": {
            "top_left":  [-2.235143, 53.482358],
            "bottom_right": {
              "lon": 28.955043,
              "<caret>"
            },
            "field": "geo"
        }
      }`;
        const completionResults = await getCompletions(content);
        assert.notStrictEqual(completionResults, null, "No completions found");
        assert.ok(
            completionResults.includes("lat"),
            "Expected completion 'lat' not found",
        );
    });

    test("location", async () => {
        const content = `{
        "query": {
           "location": {
             "<caret>"
           },
             "distance": "100mi",
             "field": "geo"
       }
      }`;
        const completionResults = await getCompletions(content);
        assert.notStrictEqual(completionResults, null, "No completions found");
        for (const keyword of locationCbsContributor.keys) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });
});
