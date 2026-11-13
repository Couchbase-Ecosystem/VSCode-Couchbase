// __mocks__/vscode.js

const vscode = {
    languages: {
        createDiagnosticCollection: jest.fn().mockImplementation(() => {
            const diagnosticsMap = new Map();
            return {
                clear: jest.fn(() => diagnosticsMap.clear()),
                dispose: jest.fn(),
                get: jest.fn((uri) => diagnosticsMap.get(uri.toString())),
                set: jest.fn((uri, diagnostics) =>
                    diagnosticsMap.set(uri.toString(), diagnostics),
                ),
                delete: jest.fn((uri) => diagnosticsMap.delete(uri.toString())),
                forEach: jest.fn((callback) =>
                    diagnosticsMap.forEach(callback),
                ),
            };
        }),
    },
    window: {
        createOutputChannel: jest.fn().mockImplementation(() => ({
            appendLine: jest.fn(),
            append: jest.fn(),
            show: jest.fn(),
            dispose: jest.fn(),
        })),
        showErrorMessage: jest.fn(),
        showInformationMessage: jest.fn(),
        showWarningMessage: jest.fn(),
    },
    Uri: {
        parse: jest.fn().mockImplementation((str) => ({
            toString: () => str,
        })),
        file: jest.fn().mockImplementation((fsPath) => ({
            fsPath: fsPath,
            toString: () => fsPath,
        })),
    },
    TreeItemCollapsibleState: {
        None: 0,
        Collapsed: 1,
        Expanded: 2,
    },
    TreeItem: class TreeItem {
        constructor(label, collapsibleState) {
            this.label = label;
            this.collapsibleState = collapsibleState;
        }
    },
    workspace: {
        openTextDocument: jest.fn().mockImplementation((uri) => ({
            getText: jest.fn(() => ""),
            uri: uri,
            positionAt: jest.fn().mockImplementation((index) => {
                return new vscode.Position(
                    Math.floor(index / 100),
                    index % 100,
                );
            }),
        })),
        fs: {
            writeFile: jest.fn(),
            createDirectory: jest.fn(),
        },
    },
    Range: jest.fn().mockImplementation((start, end) => ({
        start: start,
        end: end,
    })),
    Position: jest.fn().mockImplementation((line, character) => ({
        line: line,
        character: character,
    })),
    Diagnostic: jest.fn().mockImplementation((range, message, severity) => ({
        range: range,
        message: message,
        severity: severity,
    })),
    DiagnosticSeverity: {
        Error: 0,
        Warning: 1,
        Information: 2,
        Hint: 3,
    },
};

module.exports = vscode;
