import { DATABASE_HEALTHY_STATE, DATABASE_LOADING_STATE, DatabaseLoadingState } from 'constants/database-state';
import { DELIVERY_METHOD, DeliveryMethod } from 'constants/delivery-method';
import { Provider } from 'constants/provider';
import { ServerService } from 'constants/service';
import {
  AccessType,
  BucketPermission,
  BucketPermissions,
  BucketScopePermission,
  ProvisionedApiKeyPermissions,
  ReadWritePermissions,
} from 'sync/access-service';
import {
  Database,
  DatabaseProvider,
  DatabaseProviderInformation,
  HostedProvider,
  InVpcProvider,
  ServerlessProvider,
} from 'sync/database-service';

export function hasProviderDetails(provider: DatabaseProvider): provider is HostedProvider | InVpcProvider | ServerlessProvider {
  return 'name' in provider && 'region' in provider;
}

export const isHealthyDatabase = (database: Partial<Database>) => {
  return (database?.status?.state ?? '') in DATABASE_HEALTHY_STATE;
};

export function displayDeliveryMethod(method: DeliveryMethod) {
  return DELIVERY_METHOD[method];
}

/**
 * For G1 clusters remove the Couchbase Server variant to only show the version number.
 */
export function displayVersion(version?: string) {
  if (version) {
    return version.replace('enterprise-', '');
  }
  return undefined;
}

export const getDatabaseState = (database: Partial<Database>): DatabaseLoadingState => {
  if (!isHealthyDatabase(database)) {
    return 'error';
  }
  return String(database?.status?.state) in DATABASE_LOADING_STATE ? 'loading' : 'success';
};

export function getProvider(provider: DatabaseProvider): DatabaseProviderInformation | undefined {
  if (!hasProviderDetails(provider)) {
    return undefined;
  }
  return {
    name: provider.name,
    region: provider.region,
  };
}

export const getProviderName = (database?: Database): Provider | undefined => {
  if (!database?.provider) {
    return undefined;
  }
  return getProvider(database?.provider)?.name;
};

export const isServerless = (database?: Database) => {
  return database?.provider.deliveryMethod === 'serverless';
};

export const isProvisioned = (database?: Database) => {
  return database?.provider.deliveryMethod !== 'serverless';
};

// escapeCharacters lists those that would require escaping when writing a SQL++ query.
export const escapeCharacters = `" +-=&|><!(){}[]^\\"~*?:\\\\/`;

/**
 * textContainsEscapedCharacters returns true of any characters exist in the provided string that require
 * escaping when creating SQL++ queries. These characters include " +-=&|><!(){}[]^\\"~*?:\\\\/ (note the space).
 * @param text
 */
export const textContainsEscapedCharacters = (text: string) => {
  // regex to test against escape characters.
  // eslint-disable-next-line
  const regex = /[\+\-\=\&\|\>\<\!\(\)\{\}\[\]\^\"\~\*\?\:\\\/" "]/;
  return regex.test(text);
};

/**
 * Return whether the database services include an eventing or cbas
 * service.
 * */
export function hasProServices(services: ServerService[]) {
  return services.includes('eventing') || services.includes('cbas');
}

export function isAllowDatabaseManagement(database: Database) {
  const state = database?.status?.state;

  if (!state) {
    return false;
  }

  return [
    'healthy',
    'peering',
    'needsRedeployment',
    'scale_failed',
    'upgrade_failed',
    'peering_failed',
    'rebalance_failed',
    // we rely on RA flags to show hibernation/on/off related tabs.
    // so we need to let these statuses go through.
    'turning_on_failed',
    'turning_off_failed',
    'turning_on',
    'turning_off',
    'pausing',
    'resuming',
    'turned_off',
    'paused',
  ].includes(String(state));
}

export function isAllowDatabaseDataInteractions(database: Database) {
  const state = database?.status?.state;

  if (!state) {
    return false;
  }

  return [
    'healthy',
    'scaling',
    'upgrading',
    'peering',
    'rebalancing',
    'needsRedeployment',
    'scale_failed',
    'upgrade_failed',
    'peering_failed',
    'rebalance_failed',
    // we rely on RA flags to show hibernation/on/off related tabs.
    // so we need to let these statuses go through.
    'turning_on_failed',
    'turning_off_failed',
    'turning_on',
    'turning_off',
    'pausing',
    'resuming',
    'turned_off',
    'paused',
  ].includes(String(state));
}

const getBucketPermissions = (roles: ProvisionedApiKeyPermissions[]): BucketPermission[] => {
  const bucketsWithScopes = roles.reduce<{ [key: string]: BucketScopePermission[] }>((access, current) => {
    const innerAccess = access;
    if (current.bucket && !access[current.bucket]) {
      // eslint-disable-next-line no-param-reassign
      innerAccess[current.bucket] = current.scope ? [{ name: current.scope }] : [];
    } else if (current.bucket && current.scope) {
      innerAccess[current.bucket].push({ name: current.scope });
    }

    return innerAccess;
  }, {});

  return Object.keys(bucketsWithScopes).map((bucket) => {
    if (bucketsWithScopes[bucket].length) {
      return {
        name: bucket,
        scopes: bucketsWithScopes[bucket],
      };
    }

    return {
      name: bucket,
    };
  });
};

const getPermissions = (roles: ProvisionedApiKeyPermissions[]) => {
  if (roles.find((role) => role.bucket === '*')) {
    return {};
  }

  if (roles.length) {
    return { buckets: getBucketPermissions(roles) };
  }

  return undefined;
};

export const getDBCredentialPermissions = (roles: ProvisionedApiKeyPermissions[]): ReadWritePermissions => {
  const readRoles = roles.filter((role) => role.access === 'read' || role.access === 'read_write');
  const writeRoles = roles.filter((role) => role.access === 'write' || role.access === 'read_write');

  const readPermissions = getPermissions(readRoles);
  const writePermissions = getPermissions(writeRoles);

  return { data_reader: readPermissions, data_writer: writePermissions };
};

const getScopeRoles = (bucket: string, scopes: BucketScopePermission[], access: AccessType): ProvisionedApiKeyPermissions[] => {
  return scopes.map((scope) => ({ bucket, access, scope: scope.name }));
};

const getBucketRoles = (bucketPermissions: BucketPermission[], access: AccessType): ProvisionedApiKeyPermissions[] => {
  return bucketPermissions.flatMap((permission) => {
    if (!permission.scopes) {
      return { bucket: permission.name, access };
    }

    return getScopeRoles(permission.name, permission.scopes, access);
  });
};

const getRoles = (access: AccessType, permissions?: BucketPermissions): ProvisionedApiKeyPermissions[] => {
  if (!permissions) {
    return [];
  }

  if (!permissions.buckets) {
    return [{ bucket: '*', access }];
  }

  return getBucketRoles(permissions.buckets, access);
};

const isEqual = (a: ProvisionedApiKeyPermissions) => (b: ProvisionedApiKeyPermissions) => {
  return a.bucket === b.bucket && a?.scope === b?.scope;
};

export const getFormRoles = (permissions: ReadWritePermissions): ProvisionedApiKeyPermissions[] => {
  const { data_reader: readPermissions, data_writer: writePermissions } = permissions;

  const readRoles = getRoles('read', readPermissions);
  let writeRoles = getRoles('write', writePermissions);

  const readWithReadWriteRoles = readRoles.map((role) => {
    const hasWriteRole = writeRoles.some(isEqual(role));
    return {
      bucket: role.bucket,
      scope: role.scope,
      access: hasWriteRole ? 'read_write' : 'read',
    };
  }) as ProvisionedApiKeyPermissions[];

  writeRoles = writeRoles.filter((role) => {
    return !readWithReadWriteRoles.some(isEqual(role));
  });

  return [...readWithReadWriteRoles, ...writeRoles];
};
