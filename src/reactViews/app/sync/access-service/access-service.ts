import { defaultPaginationQuery, type QueryOptions } from 'sync/query';
import { deleteRequest, getRequest, postRequest } from 'sync/request';
import type { ApiKeyContext, DatabaseContext, OrganizationContext } from 'sync/request.types';
import type {
  CreateOrganizationApiKeyPayload,
  CreateProvisionedApiKeyPayload,
  OrganizationApiKey,
  OrganizationApiKeyListResponse,
  ProvisionedApiKeyListResponse,
  ProvisionedApiKeyResponse,
  ServerlessApiKeyListResponse,
  ServerlessApiKeyResponse,
  UpdateProvisionedApiKeyPayload,
} from './access-service.types';

/**
 * Request to return a list of **provisioned database** API keys.
 */
export function listAccessService(
  { projectId, organizationId, databaseId }: DatabaseContext,
  params: QueryOptions = defaultPaginationQuery
) {
  return getRequest<ProvisionedApiKeyListResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/users`,
    { params }
  );
}

/**
 * Request to get a specified **provisioned database** API key.
 */
export function getAccessService({ projectId, organizationId, databaseId, keyId }: ApiKeyContext) {
  return getRequest<ProvisionedApiKeyResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/users/${keyId}`
  );
}

/**
 * Request to create a **provisioned database** API key.
 */
export function createAccessService({ projectId, organizationId, databaseId }: DatabaseContext, data: CreateProvisionedApiKeyPayload) {
  return postRequest<ProvisionedApiKeyResponse>(`/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/users`, {
    data,
  });
}

/**
 * Request to update a **provisioned database** API key.
 */
export function updateAccessService({ projectId, organizationId, databaseId, keyId }: ApiKeyContext, data: UpdateProvisionedApiKeyPayload) {
  return postRequest<ProvisionedApiKeyResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/users/${keyId}`,
    {
      data,
    }
  );
}

/**
 * Request to delete a **provisioned database** API key.
 */
export function deleteAccessService({ projectId, organizationId, databaseId, keyId }: ApiKeyContext) {
  return deleteRequest<{}>(`/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/users/${keyId}`);
}

/**
 * Request to return a list of database API keys.
 */
export function listServerlessAccessService(
  { projectId, organizationId, databaseId }: DatabaseContext,
  params: QueryOptions = defaultPaginationQuery
) {
  return getRequest<ServerlessApiKeyListResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/databases/${databaseId}/keys`,
    { params }
  );
}

/**
 * Request to return a specified database API key.
 */
export function getServerlessAccessService({ projectId, organizationId, databaseId, keyId }: ApiKeyContext) {
  return getRequest<ServerlessApiKeyResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/databases/${databaseId}/keys/${keyId}`
  );
}

/**
 * Request to create an API Key for a specified database.
 * @remarks This currently requires passing an empty body.
 * @todo API changes required: Remove body payload.
 */
export function createServerlessAccessService({ projectId, organizationId, databaseId }: DatabaseContext) {
  return postRequest<ServerlessApiKeyResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/databases/${databaseId}/keys`,
    {}
  );
}

/**
 * Request to create an API Key for a specified database.
 */
export function deleteServerlessAccessService({ projectId, organizationId, databaseId, keyId }: ApiKeyContext) {
  return deleteRequest<{}>(`/v2/organizations/${organizationId}/projects/${projectId}/databases/${databaseId}/keys/${keyId}`);
}

/**
 * Request to return a list of organization API keys.
 * @remarks This is a v1 endpoint.
 * @property - tenantId required in the query string.
 */
export function listOrganizationKeysAccessService({ organizationId }: OrganizationContext, params: QueryOptions = defaultPaginationQuery) {
  const newParams = {
    tenantId: organizationId,
    ...params,
  };
  return getRequest<OrganizationApiKeyListResponse>(`/tokens`, { params: newParams });
}

/**
 * Request to create an API Key for a specified organization.
 * @remarks This is a v1 endpoint.
 */
export function createOrganizationKeyAccessService({ organizationId }: OrganizationContext, data: CreateOrganizationApiKeyPayload) {
  return postRequest<OrganizationApiKey>(`/tokens`, { data: { ...data, tenantId: organizationId } });
}

/**
 * Request to delete an API Key for a specified organization.
 * @remarks This is a v1 endpoint.
 */
export function deleteOrganizationKeyAccessService({ keyId }: { keyId: string }) {
  return deleteRequest<{}>(`/tokens/${keyId}`);
}
