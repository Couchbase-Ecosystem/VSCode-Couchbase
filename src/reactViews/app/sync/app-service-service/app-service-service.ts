import { DatabaseResponse } from 'sync/database-service';
import { defaultPaginationQuery, QueryOptions } from 'sync/query';
import { deleteRequest, getRequest, postRequest, putRequest } from 'sync/request';
import {
  AppEndpointContext,
  AppServiceContext,
  AppServiceEndpointContext,
  AppServiceEndpointUserContext,
  OrganizationContext,
  ProjectContext,
} from 'sync/request.types';
import {
  AdminUserListResponse,
  AdminUserResponse,
  AppEndpoint,
  AppEndpointConnectResponse,
  AppEndpointListResponse,
  AppEndpointOidcPayload,
  AppEndpointSyncResponse,
  AppServiceCreateResponse,
  AppServiceDeploymentCostPayload,
  AppServiceDeploymentCostResponse,
  AppServiceDeploymentOptions,
  AppServiceEndpointCertResponse,
  AppServiceListResponse,
  AppServiceResponse,
  AppServiceSpecResponse,
  AppUser,
  AppUserListResponse,
  AppUserResponse,
  CreateAdminUserPayload,
  CreateAppEndpointPayload,
  CreateAppServicePayload,
  CreateAppUserPayload,
  ResyncRequest,
  UpdateAppServicePayload,
  UpdateAppUserPayload,
} from './app-service-service.types';

/**
 * Request to return a list of `AppServices`.
 */
export function listAppServices({ organizationId }: OrganizationContext, params: QueryOptions = defaultPaginationQuery) {
  return getRequest<AppServiceListResponse>(`/v2/organizations/${organizationId}/backends`, { params });
}

/**
 * Request to return a list of `AppServices` for a given project
 */
export function listProjectAppServices({ organizationId, projectId }: ProjectContext, params?: QueryOptions) {
  return getRequest<AppServiceListResponse>(`/v2/organizations/${organizationId}/projects/${projectId}/backends`, { params });
}

/**
 * Request to return a specified `AppService`.
 */
export function getAppService({ appServiceId, projectId, organizationId, databaseId }: AppServiceContext) {
  return getRequest<AppServiceResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}`
  );
}

/**
 * Request to return a specified `AppService`.
 */
export function createAppService({ organizationId }: OrganizationContext, data: CreateAppServicePayload) {
  return postRequest<AppServiceCreateResponse>(`/v2/organizations/${organizationId}/backends`, { data });
}

/**
 * Request to update the configuration for a specified `AppService`.
 */
export function updateAppService(
  { appServiceId, projectId, organizationId, databaseId }: AppServiceContext,
  data: UpdateAppServicePayload
) {
  return postRequest<AppServiceResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}`,
    {
      data,
    }
  );
}

/**
 * Request to delete a specified `AppService`.
 */
export function deleteAppService({ appServiceId, projectId, organizationId, databaseId }: AppServiceContext) {
  return deleteRequest<{}>(`/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}`);
}

/**
 * Request to return the specifications of a given database associated with a given `AppServices`.
 */
export function getAvailableSpecsAppServices({ appServiceId, projectId, organizationId, databaseId }: AppServiceContext) {
  return getRequest<AppServiceSpecResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/specs`
  );
}

/**
 * Request to return all databases associated with a given `AppServices`.
 */
export function listEndpointsAppServices(
  { appServiceId, projectId, organizationId, databaseId }: AppServiceContext,
  params: QueryOptions = defaultPaginationQuery
) {
  return getRequest<AppEndpointListResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases`,
    { params }
  );
}

/**
 * Request to retrieve a particular endpoint.
 *
 * **Important** this is a temporary solution for launch as no getEndpointById API exists for us to use.
 */
export function getEndpoint({ projectId, appEndpointId, organizationId, databaseId, appServiceId }: AppEndpointContext) {
  return listEndpointsAppServices({ projectId, appServiceId, organizationId, databaseId }, { page: 1, perPage: 250 }).then((response) => {
    const endpoint = response.data.find((endpoint) => endpoint.data.ID === appEndpointId);
    if (endpoint !== undefined) {
      return endpoint;
    }
    return null;
  });
}

/**
 * Request to return read/write access and data validation policies
 */
export function getAppEndpointSync({ appEndpointId, appServiceId, organizationId, databaseId, projectId }: AppServiceEndpointContext) {
  return getRequest<AppEndpointSyncResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/sync`
  );
}

/**
 * Request to save read/write access and data validation policies
 */
export function saveAppEndpointSync(
  { appEndpointId, appServiceId, projectId, organizationId, databaseId }: AppServiceEndpointContext,
  data: string
) {
  return putRequest<string>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/sync`,
    { data }
  );
}

/**
 * Request to save read/write access and data validation policies
 */
export function runAppEndpointResync(
  { appEndpointId, appServiceId, organizationId, databaseId, projectId }: AppServiceEndpointContext,
  params: QueryOptions = defaultPaginationQuery
) {
  return postRequest<{}>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/resync`,
    { params }
  );
}

/**
 * Request sync status
 */
export function getAppEndpointSyncStatus({
  appEndpointId,
  appServiceId,
  projectId,
  organizationId,
  databaseId,
}: AppServiceEndpointContext) {
  return getRequest<ResyncRequest>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/resync`
  );
}

/**
 * Stop resyncing app service
 */
export function stopResyncAppService({ appServiceId, appEndpointId, organizationId, databaseId, projectId }: AppServiceEndpointContext) {
  return postRequest<{}>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/resync?action=stop`
  );
}

/**
 * Request to return a specified database associated with a given `AppServices`.
 */
export function createEndpointAppServices(
  { projectId, appServiceId, organizationId, databaseId }: AppServiceContext,
  data: CreateAppEndpointPayload
) {
  return postRequest<DatabaseResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases`,
    { data }
  );
}

/**
 * Request to return the available specifications for `AppServices`.
 */
export function getDeploymentOptionsAppServices({ organizationId }: OrganizationContext) {
  return getRequest<AppServiceDeploymentOptions>(`/v2/organizations/${organizationId}/backends/deployment-options`);
}

/**
 * Request to return the deployment costs for `AppServices`.
 */
export function getDeploymentCostsAppServices({ organizationId }: OrganizationContext, data: AppServiceDeploymentCostPayload) {
  return postRequest<AppServiceDeploymentCostResponse>(`/v2/organizations/${organizationId}/backends/deployment-costs`, { data });
}

/**
 * Request to return the deployment costs for `AppServices Endpoint`.
 */
export function getPublicCertificateAppServices({
  appServiceId,
  appEndpointId,
  organizationId,
  databaseId,
  projectId,
}: AppEndpointContext) {
  return getRequest<AppServiceEndpointCertResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/publiccert`
  );
}

/**
 * Connect `AppService Endpoint`.
 */
export function connectEndpointAppService({
  appServiceId,
  projectId,
  appEndpointId,
  organizationId,
  databaseId,
}: AppServiceEndpointContext) {
  return getRequest<AppEndpointConnectResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/connect`
  );
}

/**
 * Pause `AppService Endpoint`.
 */
export function pauseEndpointAppService({ appEndpointId, appServiceId, organizationId, databaseId, projectId }: AppServiceEndpointContext) {
  return postRequest<{}>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/offline`
  );
}

/**
 * Resume `AppService Endpoint`.
 */
export function resumeEndpointAppService({
  appEndpointId,
  appServiceId,
  projectId,
  organizationId,
  databaseId,
}: AppServiceEndpointContext) {
  return postRequest<{}>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/online`
  );
}

/**
 * Updates and `AppService Endpoint`.
 */
export function updateEndpointAppService(
  { appServiceId, appEndpointId, organizationId, databaseId, projectId }: AppServiceEndpointContext,
  data: AppEndpoint
) {
  return putRequest<{}>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}`,
    { data }
  );
}

/**
 * Delete `AppService Endpoint`.
 */
export function deleteEndpointAppService({
  appEndpointId,
  appServiceId,
  organizationId,
  databaseId,
  projectId,
}: AppServiceEndpointContext) {
  return deleteRequest<{}>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}`
  );
}

/**
 * Toggle `App Endpoint basicauth`.
 */
export function toggleBasicAuthAppService(
  { appServiceId, appEndpointId, organizationId, databaseId, projectId }: AppServiceEndpointContext,
  params: QueryOptions = defaultPaginationQuery
) {
  return postRequest<{}>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/basicauth`,
    { params }
  );
}

/**
 * Toggle `App Endpoint anonymous`.
 */
export function toggleAnonymousAppService(
  { appServiceId, appEndpointId, organizationId, databaseId, projectId }: AppServiceEndpointContext,
  params: QueryOptions = defaultPaginationQuery
) {
  return postRequest<{}>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/anonymous`,
    { params }
  );
}

/**
 * Save `App Endpoint oidc settigns`.
 */
export function saveOidcAppService(
  { appServiceId, appEndpointId, organizationId, databaseId, projectId }: AppServiceEndpointContext,
  data: AppEndpointOidcPayload
) {
  return postRequest<{}>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/oidc`,
    { data }
  );
}

/**
 * Disable `App Endpoint oidc`.
 */
export function deleteOidcAppService({ appServiceId, appEndpointId, organizationId, databaseId, projectId }: AppServiceEndpointContext) {
  return deleteRequest<{}>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/oidc`
  );
}

/**
 * Delete the import filter of an endpoint.
 */
export function deleteEndpointImportFilterAppService({
  appServiceId,
  appEndpointId,
  organizationId,
  databaseId,
  projectId,
}: AppServiceEndpointContext) {
  return deleteRequest<{}>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/importfilter`
  );
}

/**
 * Return a list of admin credentials.
 */
export function listAdminUsersAppService(
  { appEndpointId, appServiceId, organizationId, databaseId, projectId }: AppServiceEndpointContext,
  params: QueryOptions = defaultPaginationQuery
) {
  return getRequest<AdminUserListResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/adminusers`,
    { params }
  );
}

/**
 * Create admin credentials.
 */
export function createAdminUserAppService(
  { appEndpointId, appServiceId, organizationId, databaseId, projectId }: AppServiceEndpointContext,
  data: CreateAdminUserPayload
) {
  return postRequest<AdminUserResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/adminusers`,
    { data }
  );
}

/**
 * Delete admin credentials
 */
export function deleteAdminUserAppService({
  appServiceId,
  appEndpointId,
  organizationId,
  databaseId,
  projectId,
  name,
}: AppServiceEndpointUserContext) {
  return deleteRequest<{}>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/adminusers/${name}`
  );
}

/**
 * Search for a user by name
 */
export function getAdminUserAppService({
  appServiceId,
  appEndpointId,
  organizationId,
  databaseId,
  name,
  projectId,
}: AppServiceEndpointUserContext) {
  return getRequest<AdminUserResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/adminusers/${name}`
  );
}

/**
 * Return a list of users (non-admins)
 */
export function listUsersAppService(
  { appEndpointId, appServiceId, organizationId, projectId, databaseId }: AppServiceEndpointContext,
  params: QueryOptions = defaultPaginationQuery
) {
  return getRequest<AppUserListResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/users`,
    { params }
  );
}

/**
 * Search for a user by name
 */
export function getUserAppService({
  appServiceId,
  appEndpointId,
  organizationId,
  databaseId,
  projectId,
  name,
}: AppServiceEndpointUserContext) {
  return getRequest<AppUserResponse>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/users/${encodeURIComponent(
      name
    )}`
  );
}

/**
 * Create user.
 */
export function createUserAppService(
  { appEndpointId, appServiceId, organizationId, databaseId, projectId }: AppServiceEndpointContext,
  data: CreateAppUserPayload
) {
  return postRequest<AppUser>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/users`,
    { data }
  );
}

/**
 * Update user
 */
export function updateUserAppService(
  { appServiceId, appEndpointId, organizationId, databaseId, projectId, name }: AppServiceEndpointUserContext,
  data: UpdateAppUserPayload
) {
  return putRequest<AppUser>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/users/${encodeURIComponent(
      name
    )}`,
    { data }
  );
}

/**
 * Update user password
 */
export function updateUserPasswordAppService(
  { appEndpointId, appServiceId, organizationId, databaseId, projectId, name }: AppServiceEndpointUserContext,
  data: UpdateAppUserPayload
) {
  return putRequest<{}>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/users/${encodeURIComponent(
      name
    )}/password`,
    { data }
  );
}

/**
 * Delete user
 */
export function deleteUser({ organizationId, projectId, databaseId, appServiceId, appEndpointId, name }: AppServiceEndpointUserContext) {
  return deleteRequest<{}>(
    `/v2/organizations/${organizationId}/projects/${projectId}/clusters/${databaseId}/backends/${appServiceId}/databases/${appEndpointId}/users/${encodeURIComponent(
      name
    )}`
  );
}
