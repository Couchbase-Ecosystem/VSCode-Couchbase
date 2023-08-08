import { Option } from 'components/support-ticket-form/support-ticket-form.types';
import { DATABASE_ACCESS } from 'constants/database-access';
import { Provider } from 'constants/provider';
import { AWS_SERVERLESS_REGION, PROVIDER_REGION } from 'constants/provider-region';
import { REPLICATION_DIRECTION, REPLICATION_PRIORITY } from 'constants/replication';
import { CAPELLA_SERVICE, SERVER_SERVICE } from 'constants/service';
import { AppServiceNodeCount } from 'sync/app-service-service';
import { BucketListResponse } from 'sync/bucket-service';
import { ProxyScopesListResponse } from 'sync/proxy-service';

/**
 * Returns a Select configuration for `buckets`.
 * @returns {Option[]}
 */
export function createBucketOptionsForScopes(list: BucketListResponse): Option[] {
  return list.buckets.data.map((entry) => ({
    label: entry.data.name,
    value: entry.data.name,
  }));
}

/**
 * Returns a Select configuration for `database access`.
 * @returns {Option[]}
 */
export function createDatabaseAccessOptions(): Option[] {
  return Object.keys(DATABASE_ACCESS).map((entry) => ({
    label: (DATABASE_ACCESS as object)[entry as keyof object],
    value: entry,
  }));
}

export const createNodeOptions = (nodeCounts: AppServiceNodeCount) => {
  return Array.from(new Array(nodeCounts.max_count - nodeCounts.min_count + 1)).map((_, index) => ({
    label: (index + nodeCounts.min_count).toString(),
    value: index + nodeCounts.min_count,
  }));
};

/**
 * Returns an object supported by our `Select` component.
 * @param provider - Lower-case abbreviation of the cloud provider.
 * @returns {Option[]}
 */
export function createRegionOptions(provider: Provider): Option[] {
  return Object.keys(PROVIDER_REGION[provider]).map((entry) => ({
    label: (PROVIDER_REGION[provider] as object)[entry as keyof object],
    value: entry,
  }));
}

/**
 * Returns a Select configuration for `replication direction`.
 * @returns {Option[]}
 */
export function createReplicationDirectionOptions(): Option[] {
  return Object.keys(REPLICATION_DIRECTION).map((entry) => ({
    label: (REPLICATION_DIRECTION as object)[entry as keyof object],
    value: entry,
  }));
}

/**
 * Returns a Select configuration for `replication priority`.
 * @returns {Option[]}
 */
export function createReplicationPriorityOptions(): Option[] {
  return Object.keys(REPLICATION_PRIORITY).map((entry) => ({
    label: (REPLICATION_PRIORITY as object)[entry as keyof object],
    value: entry,
  }));
}

/**
 * Returns a Select configuration for `scopes`.
 * @returns {Option[]}
 */
export function createScopesOptionsForCollections(list: ProxyScopesListResponse): Option[] {
  return list.scopes.map((entry) => ({
    label: entry.name,
    value: entry.name,
  }));
}

/**
 * Returns a Select configuration for AWS serverless regions.
 */
export function createServerlessAwsRegionOptions() {
  return Object.keys(AWS_SERVERLESS_REGION).map((entry) => ({
    label: AWS_SERVERLESS_REGION[entry as keyof object],
    value: entry,
  }));
}

/**
 * Returns a Select configuration of services for `Couchbase Server`.
 * @returns {Option[]}
 */
export function createServerServiceOptions(): Option[] {
  return Object.keys(SERVER_SERVICE).map((entry) => ({
    label: (SERVER_SERVICE as object)[entry as keyof object],
    value: entry,
  }));
}

/**
 * Returns a Select configuration of services for `Capella`.
 * @returns {Option[]}
 */
export function createCapellaServiceOptions(): Option[] {
  return Object.keys(CAPELLA_SERVICE).map((entry) => ({
    label: (CAPELLA_SERVICE as object)[entry as keyof object],
    value: entry,
  }));
}
