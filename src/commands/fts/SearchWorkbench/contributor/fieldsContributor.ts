import {
    CacheService,
    IBucketCache,
} from "../../../../util/cacheService/cacheService";
import { getActiveConnection } from "../../../../util/connections";
import { CouchbaseRestAPI } from "../../../../util/apis/CouchbaseRestAPI";
import { SearchIndexParser } from "../indexParser/indexParser";
import { logger } from "../../../../logger/logger";

export class fieldsContributor {
    static async getFieldNames(
        bucketName: string,
        indexName: string,
        cache: CacheService
    ): Promise<string[]> {
        const suggestions: string[] = [];
        const connection = getActiveConnection();
        if (!connection) {
            return [];
        }
        const api = new CouchbaseRestAPI(connection);

        const bucketCache = cache.getCache(bucketName);
        const result = await api.fetchSearchIndexDefinition(indexName);
        if (!bucketCache) {
            return [];
        }
        const index = result?.indexDef;
        if (index) {
            try {
                const fields = SearchIndexParser.extractPropertiesMap(index);
                fields.set(SearchIndexParser.getDefaultField(index), "");

                const isDynamic = SearchIndexParser.isIndexDynamic(index);
                if (isDynamic) {
                    const cols = SearchIndexParser.listCollections(index);
                    for (const prop of cols) {
                        if (
                            !SearchIndexParser.isCollectionDynamicallyIndexed(
                                index,
                                prop,
                            )
                        ) {
                            continue;
                        }

                        if (prop.includes(".")) {
                            const parts = prop.split(".");
                            const additionalFields =
                                this.extractFieldsFromCollection(
                                    bucketCache,
                                    parts[0],
                                    parts[1],
                                );
                            if (
                                additionalFields &&
                                typeof additionalFields[0] === "object" &&
                                additionalFields[0] !== null
                            ) {
                                const entries = Object.entries(
                                    additionalFields[0] as {
                                        [key: string]: any;
                                    },
                                );

                                entries.map((property) => {
                                    const key = property[0];
                                    const value = property[1];

                                    if (
                                        typeof value === "object" &&
                                        value !== null &&
                                        "type" in value
                                    ) {
                                        const type = value.type;
                                        if (type !== "array") {
                                            if (type === "object") {
                                                Object.entries(
                                                    value.value,
                                                ).forEach(([subKey, _]) => {
                                                    const fullKey = `${key}.${subKey}`;
                                                    fields.set(fullKey, "");
                                                });
                                            }
                                            fields.set(key, value);
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
                suggestions.push(...fields.keys());
                return suggestions;
            } catch (e) {
                logger.debug(
                    `An error occurred while trying to extract fields from index: ${indexName}` +
                        e,
                );
            }
        }
        return [];
    }

    static extractFieldsFromCollection(
        bucketCache: IBucketCache,
        scopeName: string,
        collectionName: string,
    ): any {
        const scope = bucketCache.scopes.get(scopeName);
        if (scope) {
            const collection = scope.collections.get(collectionName);
            return collection?.schema?.patterns;
        }
        return;
    }
}
