import * as vscode from "vscode";

// In-memory stand-in for the extension's globalState, for unit tests
export const fakeMemento = (): vscode.Memento => {
    const store = new Map<string, any>();
    return {
        get: (key: string, defaultValue?: any) => (store.has(key) ? store.get(key) : defaultValue),
        update: async (key: string, value: any) => { store.set(key, value); },
        keys: () => [...store.keys()],
    } as vscode.Memento;
};
