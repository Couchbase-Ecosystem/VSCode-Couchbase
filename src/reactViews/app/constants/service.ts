import { IconName } from 'components/icon';

/**
 * Services for **Couchbase Server**
 */
export const SERVER_SERVICE = {
  cbas: 'Analytics',
  kv: 'Data',
  eventing: 'Eventing',
  index: 'Index',
  n1ql: 'Query',
  fts: 'Search',
} as const;
export type ServerService = keyof typeof SERVER_SERVICE;

/**
 * Services for **Capella**
 */
export const CAPELLA_SERVICE = {
  analytics: 'Analytics',
  data: 'Data',
  eventing: 'Eventing',
  index: 'Index',
  query: 'Query',
  search: 'Search',
} as const;
export type CapellaService = keyof typeof CAPELLA_SERVICE;
export type CapellaServiceName = (typeof CAPELLA_SERVICE)[CapellaService];

/**
 * Iconography for Couchbase Server services.
 */
export const SERVER_SERVICE_ICONS: Record<ServerService, IconName> = {
  cbas: 'analytics',
  kv: 'data',
  eventing: 'eventing',
  index: 'index',
  n1ql: 'query',
  fts: 'fts',
};

/**
 * Iconography for Capella services.
 */
export const CAPELLA_SERVICE_ICONS: Record<CapellaService, IconName> = {
  analytics: 'analytics',
  data: 'data',
  eventing: 'eventing',
  index: 'index',
  query: 'query',
  search: 'fts',
};
