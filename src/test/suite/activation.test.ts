import * as assert from "assert";
import * as vscode from "vscode";

const extensionId = "couchbase.vscode-couchbase";

// Skipped until runTest.ts loads the extension: its extensionDevelopmentPath points at out/ instead of the
// repo root, and the test step would also need to build dist/extension.js (package.json "main") first.
suite.skip("Extension activation", function () {
    this.timeout(60000);

    test("the extension is installed and activates", async () => {
        const extension = vscode.extensions.getExtension(extensionId);
        assert.ok(extension, `${extensionId} should be installed`);
        await extension.activate();
        assert.strictEqual(extension.isActive, true);
    });

    test("every command declared in package.json is registered", async () => {
        const extension = vscode.extensions.getExtension(extensionId)!;
        await extension.activate();
        const declared: string[] = extension.packageJSON.contributes.commands.map((c: { command: string }) => c.command);
        const registered = new Set(await vscode.commands.getCommands(true));
        assert.deepStrictEqual(declared.filter((command) => !registered.has(command)), []);
    });
});
