import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { AutocompleteVisitor } from "../../commands/fts/SearchWorkbench/contributor/autoCompleteVisitor";
import { highlightCbsContributor } from "../../commands/fts/SearchWorkbench/contributor/highlightCbsContributor";

suite("CBSHighlightCodeCompletion Test Suite", () => {
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

    test("completion for highlight", async () => {
        const content = `{
        "highlight": {"<caret>"}
      }`;
        const completionResults = await getCompletions(content);

        assert.notStrictEqual(completionResults, null, "No completions found");
        for (const keyword of highlightCbsContributor.keys) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("dont suggest keyword already exists", async () => {
        const content = `{
        "highlight": { "fields": ["textField"],
                       "<caret>"}
      }`;
        const completionResults = await getCompletions(content);

        assert.notStrictEqual(completionResults, null, "No completions found");
        const expected = ["style"];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });

    test("suggest style values", async () => {
        const content = `{
        "highlight": { "fields": ["textField"],
                       "style": "<caret>"
        }
      }`;
        const completionResults = await getCompletions(content);

        assert.notStrictEqual(completionResults, null, "No completions found");
        const expected = ["html", "ansi"];
        for (const keyword of expected) {
            assert.ok(
                completionResults.includes(keyword),
                `Expected completion '${keyword}' not found`,
            );
        }
    });
});
