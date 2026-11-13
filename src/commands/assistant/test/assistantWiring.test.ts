// Checks everything outside the Assistant's own code that it needs in order to show up and work:
// its view, its title-bar buttons, its build entry and its registration in extension.ts.
import * as fs from "fs";
import * as path from "path";

const root = path.resolve(__dirname, "../../../..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const extensionSource = fs.readFileSync(path.join(root, "src/extension.ts"), "utf8");
const commandsSource = fs.readFileSync(path.join(root, "src/commands/extensionCommands/commands.ts"), "utf8");

const commandConstant = (id: string): string | undefined => {
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return commandsSource.match(new RegExp(`export const (\\w+)\\s*:\\s*string\\s*=\\s*"${escapedId}"`))?.[1];
};

const isRegistered = (id: string): boolean => {
    const constant = commandConstant(id);
    return (constant !== undefined && new RegExp(`registerCommand\\(\\s*Commands\\.${constant}\\b`).test(extensionSource))
        || extensionSource.includes(`registerCommand("${id}"`);
};

describe("Assistant wiring", () => {
    it("has a webview in the Couchbase sidebar", () => {
        const view = pkg.contributes.views["couchbase-activity-bar"].find((v: any) => v.id === "couchbase-assistant");
        expect(view).toEqual(expect.objectContaining({ name: "Couchbase Assistant", type: "webview" }));
    });

    it("registers the webview provider for that view", () => {
        expect(commandsSource).toMatch(/couchbaseAssistantViewsCommand\s*:\s*string\s*=\s*"couchbase-assistant"/);
        expect(extensionSource).toMatch(
            /registerWebviewViewProvider\(\s*Commands\.couchbaseAssistantViewsCommand,\s*couchbaseAssistantWebviewProvider/
        );
    });

    it("makes the view visible when the extension starts", () => {
        const view = pkg.contributes.views["couchbase-activity-bar"].find((v: any) => v.id === "couchbase-assistant");
        if (view.when) {
            expect(view.when).toBe("couchbase.showAssistantView");
            expect(extensionSource).toContain("'setContext', 'couchbase.showAssistantView', true");
        }
    });

    it("keeps its title-bar buttons, declared and registered", () => {
        const buttons = pkg.contributes.menus["view/title"]
            .filter((item: any) => /view == couchbase-assistant\b/.test(item.when))
            .map((item: any) => item.command);
        expect(buttons).toEqual(expect.arrayContaining(["vscode-couchbase.iq.newChat", "vscode-couchbase.assistant.showSettings"]));

        const declared = new Set(pkg.contributes.commands.map((c: any) => c.command));
        for (const command of buttons) {
            expect(declared.has(command)).toBe(true);
            expect(isRegistered(command)).toBe(true);
        }
    });

    it("New Chat runs the new chat handler", () => {
        expect(extensionSource).toMatch(/registerCommand\(\s*Commands\.newIqChat,\s*\(\)\s*=>\s*\{\s*newChatHandler\(\);/);
    });

    it("builds its React bundle to dist/assistant from its own folder", () => {
        const configs: any[] = require(path.join(root, "webpack.config.js"));
        const assistant = configs.find((c) => c.entry?.reactBuild === "./src/reactViews/assistant/index");
        expect(assistant).toBeDefined();
        expect(assistant.output.path).toBe(path.join(root, "dist/assistant"));
        for (const alias of Object.values<string>(assistant.resolve.alias)) {
            expect(alias.startsWith(path.join(root, "src/reactViews/assistant"))).toBe(true);
        }
    });
});
