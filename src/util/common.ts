/*
 *     Copyright 2011-2020 Couchbase, Inc.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import { IDocumentData } from "../types/IDocument";

// A function to abbreviate a given count number into a string format with an appropriate abbreviation suffix
export function abbreviateCount(count: number): string {
    if(count < 0){
        return "?";
    } else if (count < 1000) {
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

export const hasQueryService = (services: string[] | undefined) => {
    if (!services) {
        return false;
    }
    return services.includes('n1ql');
};