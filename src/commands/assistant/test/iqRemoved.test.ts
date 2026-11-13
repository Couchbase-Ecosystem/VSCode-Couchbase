// Capella iQ was removed; make sure none of it comes back by accident
import * as fs from "fs";
import * as path from "path";

const root = path.resolve(__dirname, "../../../..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const extensionSource = fs.readFileSync(path.join(root, "src/extension.ts"), "utf8");

describe("Capella iQ is removed", () => {
    it("has no iQ view", () => {
        const views = Object.values<any[]>(pkg.contributes.views).flat().map((v) => v.id);
        expect(views).not.toContain("couchbase-iq");
    });

    it("has no iQ-only commands", () => {
        const commands = pkg.contributes.commands.map((c: any) => c.command);
        expect(commands).not.toEqual(expect.arrayContaining(["vscode-couchbase.iq.logout"]));
        expect(commands).not.toEqual(expect.arrayContaining(["vscode-couchbase.iq.showSettings"]));
        expect(commands).not.toEqual(expect.arrayContaining(["vscode-couchbase.settings.showChatInterface"]));
    });

    it("has no iQ settings and no Assistant/iQ switch", () => {
        const settings = pkg.contributes.configuration.flatMap((section: any) => Object.keys(section.properties));
        expect(settings.filter((key: string) => key.startsWith("couchbase.iQ.") || key === "couchbase.ChatInterface")).toEqual([]);
    });

    it("has no menu item that only shows for iQ", () => {
        const menus = Object.values<any[]>(pkg.contributes.menus).flat();
        expect(menus.filter((item) => /couchbase-iq|showIQView/.test(item.when ?? ""))).toEqual([]);
    });

    it("no longer builds or ships the iQ panel", () => {
        const configs: any[] = require(path.join(root, "webpack.config.js"));
        expect(configs.filter((c) => /reactViews\/iq\b/.test(String(c.entry?.reactBuild)))).toEqual([]);
        expect(fs.existsSync(path.join(root, "src/reactViews/iq"))).toBe(false);
        expect(fs.existsSync(path.join(root, "src/commands/iq"))).toBe(false);
    });

    it("extension.ts no longer loads any iQ code", () => {
        expect(extensionSource).not.toMatch(/commands\/iq\//);
        expect(extensionSource).not.toContain("ChatInterface");
    });
});
