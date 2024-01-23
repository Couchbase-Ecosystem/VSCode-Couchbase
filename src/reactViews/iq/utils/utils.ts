
export const handleCodeCopy = (code: string) => {
    navigator.clipboard.writeText(code);
};

export const applyCodeQuery = (code: string) => {
    tsvscode.postMessage({
        command: "vscode-couchbase.iq.applyQuery",
        value: code
    });
};