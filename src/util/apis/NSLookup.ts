import * as dns from 'dns';
import { logger } from '../../logger/logger';

function resolveSrvAsync(hostname: string): Promise<dns.SrvRecord[]> {
    return new Promise((resolve, reject) => {
        dns.resolveSrv(hostname, (err, addresses) => {
            
            if (err) {
                reject(err);
            }
            else {
                resolve(addresses);
            };
        });
    });
}

async function lookupCapellaServers(serverURL: string): Promise<string[]> {
    const servers: string[] = [];
    const url = serverURL.replace('couchbases://', '');

    try {
       
        const srvRecords = await resolveSrvAsync(`_couchbases._tcp.${url}`);
        for (const record of srvRecords) {
            const server = record.name.replace('cloud.couchbase.com.', 'cloud.couchbase.com');
            servers.push(server);
           
            console.log(server);
        }
        return servers;
    } catch (err) {
        console.error('Error performing lookup');
        console.error(err);
        return [];
    }
}


export function getServerURL(url: string): Promise<string[]> | string[] {
    if (url.includes('cloud.couchbase.com')) {
        return lookupCapellaServers(url);
    } else {
        return [url.replace('couchbases://', '').replace('couchbase://', '')];
    }
}

