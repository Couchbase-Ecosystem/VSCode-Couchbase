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
        if(!(status.length === 3 && status.charAt(0) === '2')){
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
        if(!(status.length === 3 && status.charAt(0) === '2')){
            logger.error(`Failed to fetch bucket data, bucketName:${bucketName} , url:${url}, status:${status}`);
        }
        return bucketOverview;
    }
}
