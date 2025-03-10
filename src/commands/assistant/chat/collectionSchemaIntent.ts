import { logger } from "../../../logger/logger";
import {  ISchemaCache, CacheService } from "../../../util/cacheService/cacheService";
import { getActiveConnection } from "../../../util/connections";
import { IAdditionalContext, collectionIntentType } from "./types";

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

// Note: We are not beautifying the schema right now, keeping the code here if it's required in the future
const schemaStringify = (schema: ISchemaCache): any[] => {
    const res = [];
    for (let schemaPattern of schema.patterns) {
        res.push(schemaPatternStringify(schemaPattern));
    }
    return res;
};


// INFO: Indexes are not being sent to the assistant right now

export const collectionIntentHandler = async (jsonObject: any, cacheService: CacheService) => {

    const collections: string[] = jsonObject?.collections || [];

    console.log("collections", collections);

    if (collections.length === 0) { // No Collections found, returning
        return ["No collections found, Please don't use GetSchemaTool if you don't want to send collections"];
    }

    if (!getActiveConnection()){
        return ["No active connection found, Please don't use GetSchemaTool now as there is no active connection"];
    }
    logger.info("getting collections data intent for " + collections);
    let collectionIntent: collectionIntentType[] = [];
    for (let collection of collections) {
        const splitCollections = collection.split(".");
        if (splitCollections.length === 3) { // bucket.scope.collection format
            const [bucket, scope, col] = splitCollections;
            const collectionData = await cacheService.getCollectionWithBucketAndScopeName(bucket, scope, col);
            const schema = collectionData?.schema || undefined;
            if (schema !== undefined) {
                const stringifiedIntent: collectionIntentType = {
                    schemas: JSON.stringify(schema),
                    collection: `${bucket}.${scope}.${col}`,
                    // indexes: JSON.stringify(collectionData?.indexes || "")
                };
                collectionIntent.push(stringifiedIntent);
            }
        }
        else if (splitCollections.length === 2) { // scope.collection format
            const [scope, col] = splitCollections;
            const collectionData = await cacheService.getCollectionWithScopeName(scope, col);
            const schema = collectionData?.schema || undefined;
            if (schema !== undefined) {
                const stringifiedIntent = {
                    schemas: JSON.stringify(schema),
                    collection: `${collectionData?.bucketName}.${scope}.${col}`,
                    // indexes: JSON.stringify(collectionData?.indexes || "")
                };
                collectionIntent.push(stringifiedIntent);
            }
        } else { // collection format or any other format
            const col = collection;
            const collectionData = await cacheService.getCollectionWithCollectionName(col);
            const schema = collectionData?.schema || undefined;
            if (schema !== undefined) {
                const stringifiedIntent = {
                    schemas: JSON.stringify(schema),
                    // indexes: JSON.stringify(collectionData?.indexes || ""),
                    collection: `${collectionData?.bucketName}.${collectionData?.scopeName}.${col}`
                };
                collectionIntent.push(stringifiedIntent);
            }
        }
    }
    if (collectionIntent.length === 0) {
        return ["No Collection Schema found, Please don't use GetSchemaTool if you don't want to send correct collections"];
    }
    return collectionIntent;
};