import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { AutocompleteVisitor } from "../../commands/fts/SearchWorkbench/contributor/autoCompleteVisitor";
import { geometryCbsContributor } from "../../commands/fts/SearchWorkbench/contributor/geometryCbsContributor";

suite("CBSGeometryCodeCompletion Test Suite", () => {
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

    test("completion for geometry", async () => {
        const content = `{
        "query": {
          "field": "geojson",
          "geometry": {
            "<caret>"
          }
        }
      }`;
        const completionResults = await getCompletions(content);

        assert.notStrictEqual(completionResults, null, "No completions found");
        for (const keyword of geometryCbsContributor.keys) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("completion for geometry relation", async () => {
        const content = `{
        "query": {
          "field": "geojson",
          "geometry": {
            "relation": "<caret>"
          }
        }
      }`;
        const completionResults = await getCompletions(content);

        assert.notStrictEqual(completionResults, null, "No completions found");
        const expected = ["intersects", "within"];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });
});
