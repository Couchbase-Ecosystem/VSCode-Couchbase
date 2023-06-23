import { IDocumentData } from "../model/IDocument";

// A function to abbreviate a given count number into a string format with an appropriate abbreviation suffix
export function abbreviateCount(count: number): string {
    if (count < 1000) {
        return count.toString();
    } else if (count < 1000000) {
        return (count / 1000).toFixed(1) + "k";
    } else if (count < 1000000000) {
        return (count / 1000000).toFixed(1) + "m";
    } else {
        return (count / 1000000000).toFixed(1) + "b";
    }
}

export const extractDocumentInfo = (documentPath: string): IDocumentData => {
    // Extract the parts of the document path
    //  which looks similar to /bucket-name/scope-name/folder-name/collection-name/document-name.json.
    const [bucket, scope, directory, collection, name] = documentPath.substring(1).split("/");

    return {
        bucket,
        scope,
        collection,
        name: name.substring(0, name.indexOf(".json"))
    };
};

export const getNonce = (): string => {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};