// Fake "vscode" module for the Assistant tests: jest.mock("vscode", () => require("./vscodeMock"))
export const ColorThemeKind = { Light: 1, Dark: 2, HighContrast: 3 };

const fakeUri = (scheme: string, fsPath: string): any => ({
    fsPath,
    scheme,
    with: (change: { scheme?: string }) => fakeUri(change.scheme ?? scheme, fsPath),
    toString: () => `${scheme}://${fsPath}`,
});

export const Uri = {
    file: jest.fn((fsPath: string) => fakeUri("file", fsPath)),
    parse: jest.fn((value: string) => ({ toString: () => value })),
};

export const window = {
    createOutputChannel: jest.fn(() => ({ appendLine: jest.fn(), append: jest.fn(), show: jest.fn() })),
    onDidChangeActiveColorTheme: jest.fn(),
    activeColorTheme: { kind: ColorThemeKind.Dark },
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
};

export const commands = { executeCommand: jest.fn() };
export const env = { machineId: "test-machine-id", openExternal: jest.fn() };
export const l10n = { t: (message: string) => message };
export const workspace = { getConfiguration: jest.fn(() => ({ get: jest.fn() })) };
