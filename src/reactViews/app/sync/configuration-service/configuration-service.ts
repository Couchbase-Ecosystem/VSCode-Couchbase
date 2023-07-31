import { defaultPaginationQuery, QueryOptions } from 'sync/query';
import { getRequest, postRequest } from 'sync/request';
import { DatabaseContext, OrganizationContext } from 'sync/request.types';
import {
  DatabaseDeploymentCostPayload,
  DatabaseDeploymentCostResponse,
  DatabaseDeploymentOptions,
  DatabaseSpecResponse,
  UpdateDatabaseSpecPayload,
} from './configuration-service.types';

export function getConfiguration(
  { projectId, organizationId, databaseId }: DatabaseContext,
  params: QueryOptions = defaultPaginationQuery
) {
  return getRequest<DatabaseSpecResponse>(`/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/specs`, {
    params,
  });
}

/**
 * Request to update configurations for a specified cluster.
 */
export function updateConfigurationService({ projectId, organizationId, databaseId }: DatabaseContext, data: UpdateDatabaseSpecPayload) {
  return postRequest<void>(`/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/specs`, { data });
}

/**
 * Request to return deployment options for a specified `organization` database.
 */
export function getDeploymentOptionsConfigurationService({ organizationId }: OrganizationContext) {
  return getRequest<DatabaseDeploymentOptions>(`/v2/organizations/${organizationId}/clusters/deployment-options`);
}

/**
 * Request to return deployment costs for a specified `organization` database.
 */
export function getDeploymentCosts({ organizationId }: OrganizationContext, data: DatabaseDeploymentCostPayload) {
  return postRequest<DatabaseDeploymentCostResponse>(`/v2/organizations/${organizationId}/clusters/deployment-costs`, { data });
}
