import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { AutocompleteVisitor } from '../../commands/fts/SearchWorkbench/contributor/autoCompleteVisitor';

suite('CBSShapeCodeCompletion Test Suite', () => {
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
  
    test('completion for shape', async () => {
      const content = `{
        "query": {
          "field": "geojson",
          "geometry": {
            "shape": {
              "<caret>"
            },
            "relation": "intersects"
          }
        }
      }`;
      const completionResults = await getCompletions(content);
      
      assert.notStrictEqual(completionResults, null, "No completions found");
      const expected = ["coordinates", "type", "radius", "geometries"];
      for (const keyword of expected) {
        assert.ok(completionResults.includes(keyword), `Expected completion '${keyword}' not found`);
      }
    });
  
    test('completion for circle', async () => {
      const content = `{
        "query": {
          "field": "geojson",
          "geometry": {
            "shape": {
              "type": "Circle",
              "<caret>"
            },
            "relation": "intersects"
          }
        }
      }`;
      const completionResults = await getCompletions(content);
      
      assert.notStrictEqual(completionResults, null, "No completions found");
      assert.strictEqual(completionResults.length, 2);
      const expected = ["coordinates", "radius"];
      for (const keyword of expected) {
        assert.ok(completionResults.includes(keyword), `Expected completion '${keyword}' not found`);
      }
    });
  
    test('completion for geometry collection', async () => {
      const content = `{
        "query": {
          "field": "geojson",
          "geometry": {
            "shape": {
              "type": "GeometryCollection",
              "<caret>"
            },
            "relation": "intersects"
          }
        }
      }`;
      const completionResults = await getCompletions(content);
      
      assert.notStrictEqual(completionResults, null, "No completions found");
      assert.strictEqual(completionResults.length, 1);
      assert.ok(completionResults.includes("geometries"), "Expected completion 'geometries' not found");
    });
  
    test('completion for polygon', async () => {
      const content = `{
        "query": {
          "field": "geojson",
          "geometry": {
            "shape": {
              "type": "Polygon",
              "<caret>"
            },
            "relation": "intersects"
          }
        }
      }`;
      const completionResults = await getCompletions(content);
      
      assert.notStrictEqual(completionResults, null, "No completions found");
      assert.strictEqual(completionResults.length, 1);
      assert.ok(completionResults.includes("coordinates"), "Expected completion 'coordinates' not found");
    });
  });