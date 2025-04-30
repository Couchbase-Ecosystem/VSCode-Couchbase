import * as dns from 'dns';
import { logger } from '../../logger/logger';
import { Memory } from '../util';
import { Constants } from '../constants';
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
        }
        return servers;
    } catch (err) {
        logger.error('Error performing lookup');
        logger.error(err);
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

export function getFTSNodes(): string[] {
    try {
        const clusterOverviewData = Memory.state.get<any>(Constants.CLUSTER_OVERVIEW_DATA);
        if (!clusterOverviewData || !clusterOverviewData.nodes) {
            logger.warn('No cluster overview data available for FTS node lookup');
            return [];
        }

        // Filter nodes that have the FTS service and extract their hostnames
        const ftsNodes = clusterOverviewData.nodes
            .filter((node: any) => node.services && node.services.includes('fts'))
            .map((node: any) => {
                const hostname = node.hostname || '';
                const colonIndex = hostname.indexOf(':');
                return colonIndex > 0 ? hostname.substring(0, colonIndex) : hostname;
            })
            .filter((hostname: string) => hostname.length > 0);

        if (ftsNodes.length === 0) {
            logger.warn('No FTS nodes found in the cluster');
        } else {
            logger.info(`Found ${ftsNodes.length} FTS nodes: ${ftsNodes.join(', ')}`);
        }
        
        return ftsNodes;
    } catch (error) {
        logger.error('Error getting FTS nodes');
        return [];
    }
}
