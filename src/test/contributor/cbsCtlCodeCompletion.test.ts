import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { AutocompleteVisitor } from '../../commands/fts/SearchWorkbench/contributor/autoCompleteVisitor';
import { consistencyCbsContributor } from '../../commands/fts/SearchWorkbench/contributor/consistencyCbsContributor';
import { ctlCbsContributor } from '../../commands/fts/SearchWorkbench/contributor/ctlCbsContributor';




suite('CBSCtlCodeCompletion Test Suite', () => {
  let autocompleteVisitor: AutocompleteVisitor;
  let tempDir: string;

  setup(async () => {
    autocompleteVisitor = new AutocompleteVisitor();
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'vscode-test-'));
  });

  teardown(async () => {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  });

  const getCompletions = async (content: string): Promise<string[]> => {
    const tempFile = path.join(tempDir, 'test.json');
    await fs.promises.writeFile(tempFile, content);

    const uri = vscode.Uri.file(tempFile);
    const document = await vscode.workspace.openTextDocument(uri);
    
    const caretIndex = content.indexOf('<caret>');
    const position = document.positionAt(caretIndex);

    const completionItems = await autocompleteVisitor.getAutoCompleteContributor(document, position);
    return completionItems.map(item => item.label as string);
  };

  test('completion for ctl', async () => {
    const content = `{
      "ctl": {"<caret>"}
    }`;
    const completionResults = await getCompletions(content);
    
    assert.notStrictEqual(completionResults, null, "No completions found");
    for (const keyword of ctlCbsContributor.keys) {
      assert.ok(completionResults.includes(keyword), `Expected completion '${keyword}' not found`);
    }
  });

  test('dont suggest keyword already exists', async () => {
    const content = `{
      "ctl": { "timeout": 10000,
                "<caret>"}
    }`;
    const completionResults = await getCompletions(content);

    assert.notStrictEqual(completionResults, null, "No completions found");
    const expected = ["consistency"];
    for (const keyword of expected) {
      assert.ok(completionResults.includes(keyword), `Expected completion '${keyword}' not found`);
    }
  });

  test('completion consistency', async () => {
    const content = `{
      "ctl": {
        "timeout": 10000,
        "consistency": {
          "<caret>"
        }
      }
    }`;
    const completionResults = await getCompletions(content);

    assert.notStrictEqual(completionResults, null, "No completions found");
    for (const keyword of consistencyCbsContributor.keys) {
      assert.ok(completionResults.includes(keyword), `Expected completion '${keyword}' not found`);
    }
  });

  test('completion consistency existing values', async () => {
    const content = `{
      "ctl": {
        "timeout": 10000,
        "consistency": {
          "level": "at_plus",
          "<caret>"
        }
      }
    }`;
    const completionResults = await getCompletions(content);

    assert.notStrictEqual(completionResults, null, "No completions found");
    for (const keyword of ["vectors", "results"]) {
      assert.ok(completionResults.includes(keyword), `Expected completion '${keyword}' not found`);
    }
  });

  test('suggest level values', async () => {
    const content = `{
      "ctl": {
        "timeout": 10000,
        "consistency": {
          "vectors": {
            "searchIndexName": {
              "607/205096593892159": 2,
              "640/298739127912798": 4 
            }
          },
          "level": "<caret>",
          "results": "complete"
        }
      }
    }`;
    const completionResults = await getCompletions(content);

    assert.notStrictEqual(completionResults, null, "No completions found");
    const expected = ["at_plus", "not_bounded"];
    for (const keyword of expected) {
      assert.ok(completionResults.includes(keyword), `Expected completion '${keyword}' not found`);
    }
  });

  test('suggest results values', async () => {
    const content = `{
      "ctl": {
        "timeout": 10000,
        "consistency": {
          "vectors": {
            "searchIndexName": {
              "607/205096593892159": 2,
              "640/298739127912798": 4
            }
          },
          "results": "<caret>"
        }
      }
    }`;
    const completionResults = await getCompletions(content);

    assert.notStrictEqual(completionResults, null, "No completions found");
    const expected = ["complete"];
    for (const keyword of expected) {
      assert.ok(completionResults.includes(keyword), `Expected completion '${keyword}' not found`);
    }
  });
});