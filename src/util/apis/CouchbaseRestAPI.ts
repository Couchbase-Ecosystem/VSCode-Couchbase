import axios from "axios";
import * as keytar from "keytar";
import { Constants } from "../constants";
import { getConnectionId } from "../connections";
import { IConnection } from "../../types/IConnection";
import { logger } from "../../logger/logger";
import { plainToClass } from 'class-transformer';
import { ServerOverview } from "./ServerOverview";
import { getServerURL } from "./NSLookup";
import { URL } from 'url';
import https from 'https';
import http from 'http';
import { promisify } from 'util';
import { BucketOverview } from "./BucketOverview";
export class CouchbaseRestAPI {
    constructor(
        public readonly connection: IConnection,
    ) { }

    public async getOverview(): Promise<ServerOverview|undefined> {
        const username = this.connection.username;
        const password = await keytar.getPassword(Constants.extensionID, getConnectionId(this.connection));
        if (!password) {
            return undefined;
        }
       
        let url = (await getServerURL(this.connection.url))[0];
        logger.info("url received is "+url);
        url = (this.connection.isSecure ? "https://" + url + ":18091" : "http://" + url + ":8091" ) + "/pools/nodes";
        logger.info("url generated is "+url);
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        let content = await axios.get(url, {
            method: "GET",
            headers: {
                Authorization:`Basic ${btoa(`${username}:${password}`)}`
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            })
        });
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

        let serverOverview = plainToClass(ServerOverview ,(content.data));
        console.log("serverOverview",serverOverview);
        return serverOverview;
    }

    public async getBucketsOverview(bucketName: string): Promise<BucketOverview|undefined> {
        const username = this.connection.username;
        const password = await keytar.getPassword(Constants.extensionID, getConnectionId(this.connection));
        if (!password) {
            return undefined;
        }
       
        let url = (await getServerURL(this.connection.url))[0];
        logger.info("url received is "+url);
        url = (this.connection.isSecure ? "https://" + url + ":18091" : "http://" + url + ":8091" ) + "/pools/default/buckets/" + bucketName;
        logger.info("url generated is "+url);
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        let content = await axios.get(url, {
            method: "GET",
            headers: {
                Authorization:`Basic ${btoa(`${username}:${password}`)}`
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            })
        });
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
        let bucketOverview = plainToClass(BucketOverview ,(content.data));
        console.log(bucketOverview);
        return bucketOverview;
    }
}
