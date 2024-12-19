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

import { QueryIndex } from "couchbase";

export function getIndexDefinition(queryIndex: QueryIndex): string {
    let queryDefinition: string = "";

    if (queryIndex.isPrimary) {
        queryDefinition = "CREATE PRIMARY INDEX";
    } else {
        queryDefinition = "CREATE INDEX";
    }

    queryDefinition += ` \`${queryIndex.name}\``;
    queryDefinition += ` ON \`${queryIndex.bucketName}\``;

    if (queryIndex.scopeName && queryIndex.collectionName) {
        queryDefinition += `.\`${queryIndex.scopeName}\`.\`${queryIndex.collectionName}\``;
    }

    if (queryIndex.indexKey.length > 0) {
        const indexKeys = queryIndex.indexKey.map((key) => key.toString()).join(", ");
        queryDefinition += `(${indexKeys})`;
    }

    if (queryIndex.condition) {
        queryDefinition += ` WHERE ${queryIndex.condition}`;
    }

    if (queryIndex.partition) {
        queryDefinition += ` PARTITION BY ${queryIndex.partition}`;
    }

    return queryDefinition;

}