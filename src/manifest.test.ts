// Checks that package.json and the code agree on commands, menus and views,
// so a renamed or removed command can't leave a dead menu item behind.
import * as fs from "fs";
import * as path from "path";

const root = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const contributes = pkg.contributes;

const sourceFiles = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            return sourceFiles(fullPath);
        }
        return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [fullPath] : [];
    });

const commandConstants = (): Record<string, string> => {
    const text = fs.readFileSync(path.join(root, "src/commands/extensionCommands/commands.ts"), "utf8");
    const constants: Record<string, string> = {};
    for (const match of text.matchAll(/export const (\w+)\s*(?::\s*string)?\s*=\s*["'`]([^"'`]+)["'`]/g)) {
        constants[match[1]] = match[2];
    }
    return constants;
};

const registeredCommands = (): { registered: Set<string>; unresolved: string[] } => {
    const constants = commandConstants();
    const registered = new Set<string>();
    const unresolved: string[] = [];
    for (const file of sourceFiles(path.join(root, "src"))) {
        const text = fs.readFileSync(file, "utf8");
        for (const match of text.matchAll(/registerCommand\(\s*([^,\s)]+)/g)) {
            const arg = match[1];
            const literal = arg.match(/^["'`](.+)["'`]$/);
            const constant = arg.match(/^Commands\.(\w+)$/);
            if (literal) {
                registered.add(literal[1]);
            } else if (constant && constants[constant[1]]) {
                registered.add(constants[constant[1]]);
            } else {
                unresolved.push(`${path.relative(root, file)}: ${arg}`);
            }
        }
    }
    return { registered, unresolved };
};

const declaredCommands = new Set<string>(contributes.commands.map((c: { command: string }) => c.command));
const menuItems: { menu: string; command?: string; submenu?: string; when?: string }[] =
    Object.entries(contributes.menus).flatMap(([menu, items]) => (items as any[]).map((item) => ({ menu, ...item })));

describe("package.json manifest", () => {
    it("every registered command can be found in the source", () => {
        expect(registeredCommands().unresolved).toEqual([]);
    });

    it("every declared command is registered in the code", () => {
        const { registered } = registeredCommands();
        expect([...declaredCommands].filter((command) => !registered.has(command))).toEqual([]);
    });

    it("every menu item points to a declared command", () => {
        const missing = menuItems
            .filter((item) => item.command && !declaredCommands.has(item.command))
            .map((item) => `${item.menu}: ${item.command}`);
        expect(missing).toEqual([]);
    });

    it("every submenu used in a menu is declared", () => {
        const submenus = new Set((contributes.submenus ?? []).map((s: { id: string }) => s.id));
        const missing = menuItems
            .filter((item) => item.submenu && !submenus.has(item.submenu))
            .map((item) => `${item.menu}: ${item.submenu}`);
        expect(missing).toEqual([]);
    });

    it("every keybinding points to a declared command", () => {
        const missing = (contributes.keybindings ?? [])
            .map((k: { command: string }) => k.command)
            .filter((command: string) => !declaredCommands.has(command));
        expect(missing).toEqual([]);
    });

    it("every view named in a menu condition exists", () => {
        const views = new Set(Object.values(contributes.views).flat().map((v: any) => v.id));
        const unknown = menuItems.flatMap((item) =>
            [...(item.when ?? "").matchAll(/view == ([\w.-]+)/g)]
                .map((m) => m[1])
                .filter((view) => !views.has(view))
                .map((view) => `${item.menu}: ${item.command ?? item.submenu} -> ${view}`)
        );
        expect(unknown).toEqual([]);
    });

    it("command ids are unique", () => {
        const ids = contributes.commands.map((c: { command: string }) => c.command);
        expect(ids.filter((id: string, i: number) => ids.indexOf(id) !== i)).toEqual([]);
    });
});
