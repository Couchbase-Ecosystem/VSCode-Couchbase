import { IconName } from 'components/icon';
import { CAPELLA_SERVICE, CapellaService, CapellaServiceName, SERVER_SERVICE_ICONS, ServerService } from 'constants/service';
import { DatabaseServiceOption, DatabaseSpec, DatabaseUISpecResponse, UpdateDatabaseSpecPayload } from 'sync/configuration-service';
import { DatabaseNodeListResponse } from 'sync/database-service';
import { Option } from 'types/options';

export const getServiceLabel = (service: CapellaService) => CAPELLA_SERVICE[service];

export const getNodeCount = (response: DatabaseUISpecResponse) => {
  return (
    response?.data?.specs?.reduce((accumulator, currentValue) => {
      return accumulator + (currentValue?.count || 0);
    }, 0) || 0
  );
};

/**
 * Returns the count of {service} nodes
 * @param {DatabaseNodeListResponse} list The list of database nodes
 * @param {CapellaServiceName} service The service we are interested in
 * @return {number} the count of {service} nodes
 */
export function getServiceNodeCount(list: DatabaseNodeListResponse, service: CapellaServiceName) {
  return list.data.filter((node) => node.data.services.includes(service)).length;
}

export const hasChanged = (previousDatabaseSpec: DatabaseSpec[], currentDatabaseSpec: DatabaseSpec[]) => {
  if (previousDatabaseSpec.length !== currentDatabaseSpec.length) {
    return true;
  }

  return currentDatabaseSpec.reduce((accumulator, currentValue, index) => {
    if (accumulator) {
      return true;
    }
    const previousDatabaseSpecValue = previousDatabaseSpec[index];
    return (
      currentValue.compute !== previousDatabaseSpecValue.compute ||
      currentValue.count !== previousDatabaseSpecValue.count ||
      currentValue.services.length !== previousDatabaseSpecValue.services.length ||
      currentValue.disk.sizeInGb !== previousDatabaseSpecValue.disk.sizeInGb ||
      currentValue.disk.iops !== previousDatabaseSpecValue.disk.iops ||
      currentValue.services.some((svc) => !previousDatabaseSpecValue.services.includes(svc))
    );
  }, false);
};

/**
 * Returns whether there are nodes
 * @param {DatabaseNodeListResponse} list The list of database nodes
 * @return {boolean} Whether there are any nodes
 */
export function hasNodes(list: DatabaseNodeListResponse) {
  return list.data.length !== 0;
}

const hasService =
  <T>(svc: T) =>
  (serviceList: T[]) => {
    return serviceList.includes(svc);
  };

export const hasCbDataService = hasService<ServerService>('kv');

/**
 * Returns whether there is an unhealthy
 * @param {DatabaseNodeListResponse} list The list of database nodes
 * @return {boolean} Whether there is an Unhealthy node
 */
export function hasUnhealthyNode(list: DatabaseNodeListResponse) {
  return list.data.some((node) => node.data.status.state === 'Unhealthy');
}

export const SERVICE_LABELS: Record<ServerService, { icon: IconName; description: string; label: string }> = {
  kv: {
    description: 'Stores and manages the data within the Cluster',
    icon: SERVER_SERVICE_ICONS.kv,
    label: 'Data',
  },
  index: {
    description: 'Primary and Secondary indexes for optimal query performance',
    icon: SERVER_SERVICE_ICONS.index,
    label: 'Index',
  },
  n1ql: {
    description: 'Use for operational queries, like the front-end queries behind every page display or navigation',
    icon: SERVER_SERVICE_ICONS.n1ql,
    label: 'Query',
  },
  cbas: {
    description: "Use when don't know every aspect of the query in advance",
    icon: SERVER_SERVICE_ICONS.cbas,
    label: 'Analytics',
  },
  fts: {
    description: 'Use when you want to take advantage of natural-language querying to create, manage, and query specially-purposed indexes',
    icon: SERVER_SERVICE_ICONS.fts,
    label: 'Full Text Search',
  },
  eventing: {
    description: 'Use to streamline your business workflows',
    icon: SERVER_SERVICE_ICONS.eventing,
    label: 'Eventing',
  },
};

export const serviceOptionToOption = (serviceOption: DatabaseServiceOption): Option<ServerService, DatabaseServiceOption> => {
  return {
    label: serviceOption.service.displayName,
    value: serviceOption.service.key,
    description: SERVICE_LABELS[serviceOption.service.key].description,
    icon: SERVICE_LABELS[serviceOption.service.key].icon,
    data: serviceOption,
  };
};

export const toUpdatePayload = (specs: DatabaseSpec[]): UpdateDatabaseSpecPayload => {
  const data = specs.map((spec) => ({
    compute: { type: spec.compute },
    count: spec.count,
    disk: {
      type: spec.disk.type,
      sizeInGb: spec.disk.sizeInGb,
      iops: spec.disk.iops,
    },
    diskAutoScaling: {
      enabled: spec.diskAutoScaling.enabled,
    },
    services: spec.services.map((svc) => ({ type: svc })),
  }));
  const payload = {
    specs: data,
  };
  return payload;
};
