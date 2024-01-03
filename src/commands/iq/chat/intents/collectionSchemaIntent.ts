import { logger } from "../../../../logger/logger";
import {  ISchemaCache, CacheService } from "../../../../util/cacheService/cacheService";
import { IAdditionalContext } from "../types";

const schemaPatternStringify = (schemaPattern: any, indentLevel: number = 0) => {
    let result = '';
    const indent = '-'.repeat(indentLevel * 2);
    for (let [key, value] of schemaPattern.schemaNode) {
        if (typeof (value) === 'string') {
            result += `${indent}${key}: ${value}\n`;
        } else {
            result += `${indent}${key}:\n${schemaPatternStringify(value, indentLevel + 1)}`;
        }
    }
    return result;
};

const schemaStringify = (schema: ISchemaCache): any[] => {
    const res = [];
    for (let schemaPattern of schema.patterns) {
        res.push(schemaPatternStringify(schemaPattern));
    }
    return res;
};



export const collectionSchemaHandler = async (jsonObject: any, response: IAdditionalContext, cacheService: CacheService) => {

    const collections: string[] = jsonObject?.collections || [];

    if (collections.length === 0) { // No Collections found, returning
        return;
    }
    logger.info("getting collections data intent for " + collections);
    let schemas = [];
    for (let collection of collections) {
        let scope = "";
        let col = "";
        if (collection.includes(".")) { // It's in scope.collection format
            [scope, col] = collection.split('.', 2);
            const schema = await cacheService.getCollectionsSchemaWithScopeName(scope, col);
            if (schema !== undefined) {
                // found correct pair, we can return the schema
                const stringifiedSchema = {
                    schema: JSON.stringify(schema),
                    collection: `${scope}.${col}`
                };
                schemas.push(stringifiedSchema);
            }
        } else {
            col = collection;
            const schema = await cacheService.getCollectionSchemaWithCollectionName(col);
            if (schema !== undefined) {
                // found correct pair, we can return the schema
                const stringifiedSchema = {
                    schema: JSON.stringify(schema),
                    collection: col
                };
                schemas.push(stringifiedSchema);
            }
        }
    }
    response.schemas = schemas;
};