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
import axios from "axios";
import * as keytar from "keytar";
import { Constants } from "../constants";
import { getConnectionId } from "../connections";
import { IConnection } from "../../types/IConnection";
import { logger } from "../../logger/logger";
import { plainToClass } from 'class-transformer';
import { ServerOverview } from "./ServerOverview";
import { getServerURL } from "./NSLookup";
import https from 'https';
import { BucketOverview } from "./BucketOverview";
export class CouchbaseRestAPI {
    constructor(
        public readonly connection: IConnection,
    ) { }

    public async getOverview(): Promise<ServerOverview | undefined> {
        logger.info(`fetching cluster overview`);
        const username = this.connection.username;
        const password = await keytar.getPassword(Constants.extensionID, getConnectionId(this.connection));
        if (!password) {
            return undefined;
        }
        let url = (await getServerURL(this.connection.url))[0];
        url = (this.connection.isSecure ? `https://${url}:18091` : `http://${url}:8091`);
        url += "/pools/nodes";
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        let content = await axios.get(url, {
            method: "GET",
            headers: {
                Authorization: `Basic ${btoa(`${username}:${password}`)}`
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            })
        });
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
        let status: string = content.status.toString();
        if (!(status.length === 3 && status.charAt(0) === '2')) {
            logger.error(`Failed to fetch overview data, url:${url}, status:${status}`);
        }
        let serverOverview = plainToClass(ServerOverview, (content.data));
        return serverOverview;
    }

    public async getBucketsOverview(bucketName: string): Promise<BucketOverview | undefined> {
        logger.info(`fetching bucket, bucketName:${bucketName}`);
        const username = this.connection.username;
        const password = await keytar.getPassword(Constants.extensionID, getConnectionId(this.connection));
        if (!password) {
            return undefined;
        }
        let url = (await getServerURL(this.connection.url))[0];
        url = (this.connection.isSecure ? `https://${url}:18091` : `http://${url}:8091`);
        url += `/pools/default/buckets/${bucketName}`;

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        let content = await axios.get(url, {
            method: "GET",
            headers: {
                Authorization: `Basic ${btoa(`${username}:${password}`)}`
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            })
        });
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
        let bucketOverview = plainToClass(BucketOverview, (content.data));
        let status: string = content.status.toString();
        if (!(status.length === 3 && status.charAt(0) === '2')) {
            logger.error(`Failed to fetch bucket data, bucketName:${bucketName} , url:${url}, status:${status}`);
        }
        return bucketOverview;
    }

    public async getKVDocuments(bucketName: string, scopeName: string, collectionName: string, skip: number, limit: number) {
        const username = this.connection.username;
        const password = await keytar.getPassword(Constants.extensionID, getConnectionId(this.connection));
        if (!password) {
            return undefined;
        }
        let url = (await getServerURL(this.connection.url))[0];
        url = (this.connection.isSecure ? `https://${url}:18091` : `http://${url}:8091`);
        url += `/pools/default/buckets/${bucketName}/scopes/${scopeName}/collections/${collectionName}/docs?skip=${skip}&limit=${limit}&include_doc=false`;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        let content = await axios.get(url, {
            method: "GET",
            headers: {
                Authorization: `Basic ${btoa(`${username}:${password}`)}`
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            })
        });
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
        return content.data;
    }

    public async getKVDocumentCount(bucketName: string, scopeName: string): Promise<Map<string, number>> {
        const username = this.connection.username;
        const password = await keytar.getPassword(Constants.extensionID, getConnectionId(this.connection));
        const KVCollectionCount = new Map<string, number>;
        if (!password) {
            return KVCollectionCount;
        }
        let url = (await getServerURL(this.connection.url))[0];
        url = (this.connection.isSecure ? `https://${url}:18091` : `http://${url}:8091`);
        url += `/pools/default/stats/range/`;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const payload = JSON.stringify([
            {
                "step": 3,
                "timeWindow": 360,
                "start": -3,
                "metric": [
                    {
                        "label": "name",
                        "value": "kv_collection_item_count"
                    },
                    {
                        "label": "bucket",
                        "value": bucketName
                    },
                    {
                        "label": "scope",
                        "value": scopeName
                    }
                ],
                "nodesAggregation": "sum"
            }
        ]);
        let content = await axios.post(
            url,
            payload,
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
                },
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false,
                }),
            }
        );

        const result = content.data;

        for (const i of result[0].data) {
            if (i.metric.name === 'kv_collection_item_count') {
                const value = Number(i.values[0][1]);
                KVCollectionCount.set(`kv_collection_item_count-${bucketName}-${scopeName}-${i.metric.collection}`, value);
            }
        }
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
        return KVCollectionCount;
    }

    public async getKVDocumentMetaData(bucketName: string, scopeName: string, collectionName: string, documentId: string) {
        const username = this.connection.username;
        const password = await keytar.getPassword(Constants.extensionID, getConnectionId(this.connection));
        if (!password) {
            return undefined;
        }
        let url = (await getServerURL(this.connection.url))[0];
        url = (this.connection.isSecure ? `https://${url}:18091` : `http://${url}:8091`);
        url += `/pools/default/buckets/${bucketName}/scopes/${scopeName}/collections/${collectionName}/docs/${documentId}`;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        let content = await axios.get(url, {
            method: "GET",
            headers: {
                Authorization: `Basic ${btoa(`${username}:${password}`)}`
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            })
        });
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
        const metaData = {
            meta: content.data.meta,
            xattrs: content.data.xattrs
        };
        return metaData;
    }
}

