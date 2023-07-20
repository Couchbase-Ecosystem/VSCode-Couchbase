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
        let content = await axios.get(url, {
            method: "GET",
            headers: {
                Authorization:`Basic ${btoa(`${username}:${password}`)}`
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            })
        });
        
        let serverOverview = plainToClass(ServerOverview ,(content.data));
        console.log(serverOverview);
        return serverOverview;
    }


      
}
