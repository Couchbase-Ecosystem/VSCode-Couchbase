import { DatabaseAccess } from 'constants/database-access';
import { NODE_HEALTHY_STATE, NODE_LOADING_STATE, NODE_UNHEALTHY_STATE, NodeState } from 'constants/nodes-state';
import { PROVIDER } from 'constants/provider';
import { SUPPORTED_GCP_APPSERVICE_REGIONS } from 'constants/provider-region';
import { ServerService } from 'constants/service';
import { AccessType, ProvisionedApiKeyPermissions } from 'sync/access-service';
import { Status } from 'sync/backup-service';
import { Database, DatabaseProvider } from 'sync/database-service';
import { awsInstances, Instance, InstanceName } from 'types/sizing';
import { displayBytes } from 'utils/bytes';
import { uniqueId } from 'utils/unique-id/unique-id';
import { hasProviderDetails, isProvisioned, isServerless } from './database.utils';

export const isAwsProvider = (provider: DatabaseProvider) => hasProviderDetails(provider) && provider.name === PROVIDER.aws;
export const isAzureProvider = (provider: DatabaseProvider) => hasProviderDetails(provider) && provider.name === PROVIDER.azure;
export const isGcpProvider = (provider: DatabaseProvider) => hasProviderDetails(provider) && provider.name === PROVIDER.gcp;

/**
 * Checks if a database provider and region can be used for creating an App Service
 * @param {DatabaseProvider} provider - The database provider to be checked
 * @returns {boolean} Whether the database provider and region can be used for creating an App Service
 */
export function isAppServiceSupportedProvider(provider: DatabaseProvider) {
  if (!hasProviderDetails(provider)) {
    return false;
  }

  if (isAwsProvider(provider) || isAzureProvider(provider)) {
    return true;
  }

  // For GCP there is a disparity between the regions in which databases can be hosted
  // and where the creation of App Services is supported
  // More info: https://docs.couchbase.com/cloud/reference/gcp.html
  return SUPPORTED_GCP_APPSERVICE_REGIONS.includes(provider.region);
}

/**
 * Helper method for checking if a database contains a given service.
 */
export const hasService = (serverService: ServerService) => (database?: Database) => {
  return !!database?.services?.some((service) => {
    return service.services.some((svc) => {
      return svc.type === serverService;
    });
  });
};

/**
 * Returns whether or not a database contains the Index service
 */
export const hasIndexService = hasService('index');

/**
 * Returns whether or not a database contains the Query service
 */
export const hasQueryService = hasService('n1ql');

/**
 * Returns whether or not a database contains the Data service
 */
export const hasDataService = hasService('kv');

/**
 * Returns whether or not a database contains the Search service
 */
export const hasSearchService = hasService('fts');

/**
 * Returns whether or not a database contains the Analytics service
 */
export const hasAnalyticsService = hasService('cbas');

/**
 * Returns whether or not a database contains the Eventing service
 */
export const hasEventingService = hasService('eventing');

/**
 * Returns true if the Database contains the required services Index and Query
 * for linking an App Service.
 */
export const isAppServiceSupportedServices = (database: Database) => {
  return hasIndexService(database) && hasQueryService(database);
};

export const isIo2DiskType = (value?: string) => {
  return value === 'io2';
};

export const isOnPremProvider = (provider: DatabaseProvider) => provider.deliveryMethod === 'onPrem';

export const isProvisionedDatabaseOff = (database?: Database) => {
  return (
    !!database &&
    isProvisioned(database) &&
    ['turning_on', 'turning_off', 'turned_off', 'turning_on_failed'].includes(String(database.status.state))
  );
};

export function isServerlessDatabasePaused(database?: Database) {
  return (
    !!database && isServerless(database) && ['resuming', 'pausing', 'paused', 'resuming_failed'].includes(String(database.status.state))
  );
}

export const isUltraDiskType = (value?: string) => {
  return value === 'Ultra';
};

export function nodeStateToStatus(state: NodeState): Status {
  if (state in NODE_HEALTHY_STATE) {
    return 'success';
  }

  if (state in NODE_UNHEALTHY_STATE) {
    return 'error';
  }

  if (state in NODE_LOADING_STATE) {
    return 'loading';
  }

  return 'default';
}

export type AccessRow = {
  id: string;
  bucket: string;
  scope: string;
  access: AccessType;
};

const databaseRoleDict: Record<DatabaseAccess, { name: string; description: string }> = {
  read: {
    name: 'Read',
    description:
      'Grants the privileges of the following Couchbase roles: data_reader, data_dcp_reader, data_monitoring, fts_searcher, query_select, analytics_reader, query_execute_global_functions, query_execute_global_external_functions, analytics_select, external_stats_reader, query_execute_functions, query_execute_external_functions.',
  },
  write: {
    name: 'Write',
    description:
      'Grants the privileges of the following Couchbase roles: data_writer, fts_admin, query_insert, query_update, query_delete, query_manage_index, replication_target, analytics_admin, query_manage_global_functions, query_manage_global_external_functions, analytics_manager, scope_admin, query_manage_functions, query_manage_external_functions.',
  },
  read_write: {
    name: 'Read/Write',
    description:
      'Grants the privileges of the following Couchbase roles: all of the privileges or Read and all of the privileges of Write.',
  },
};

export const databaseRoleByAccess: DatabaseAccess[] = ['read', 'write', 'read_write'];

export const roleToAccessRow = (role: ProvisionedApiKeyPermissions): AccessRow => {
  return {
    id: uniqueId(),
    bucket: role.bucket || '*',
    scope: role.scope || '',
    access: role.access,
  };
};

export const databaseRoleOptions = () =>
  databaseRoleByAccess.map((key) => ({
    label: databaseRoleDict[key].name,
    value: key,
    description: databaseRoleDict[key].description,
  }));

export const databaseRoleName = (role: DatabaseAccess) => databaseRoleDict[role].name;

export const getInstance = (name: InstanceName): Instance => {
  const instance = awsInstances.find((instance) => instance.name === name);
  if (!instance) {
    throw Error(`instance not found! - ${name}`);
  }
  return instance;
};

export const getInstanceLabel = (instance: Instance) => {
  return `${instance.vCpu}vCPUs ${displayBytes(instance.memory, {
    inputUnit: 'GiB',
    outputUnit: 'GiB',
  })}`;
};

export const displayInstance = (name: InstanceName) => getInstanceLabel(getInstance(name));
