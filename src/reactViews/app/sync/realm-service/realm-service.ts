import { defaultPaginationQuery, QueryOptions } from 'sync/query';
import { deleteRequest, getRequest, postRequest, putRequest } from 'sync/request';
import { OrganizationContext, RealmContext } from 'sync/request.types';
import {
  CreateRealmPayload,
  CreateRealmResponse,
  DeleteRealmPayload,
  RealmListResponse,
  RealmResponse,
  UpdateRealmDefaultTeamPayload,
  UpdateRealmGroupMappingPayload,
} from './realm-service.types';

/**
 * Get SSO realm details.
 */
export function listRealmService({ organizationId }: OrganizationContext, params: QueryOptions = defaultPaginationQuery) {
  return getRequest<RealmListResponse>(`/v2/organizations/${organizationId}/realms`, { params });
}

/**
 * Get SSO realm details.
 */
export function getRealmService({ realmId, organizationId }: RealmContext) {
  return getRequest<RealmResponse>(`/v2/organizations/${organizationId}/realms/${realmId}`);
}

/**
 * Create a realm identifier for SSO.
 */
export function createRealmService({ organizationId }: OrganizationContext, data: CreateRealmPayload) {
  return postRequest<CreateRealmResponse>(`/v2/organizations/${organizationId}/realms`, { data });
}

/**
 * Create a realm identifier for SSO.
 */
export function deleteRealmService({ realmId, organizationId }: RealmContext, data: DeleteRealmPayload) {
  return deleteRequest<{}>(`/v2/organizations/${organizationId}/realms/${realmId}`, { data });
}

/**
 * Updates SSO realm team.
 */
export function updateTeamRealmService({ realmId, organizationId }: RealmContext, data: UpdateRealmDefaultTeamPayload) {
  return putRequest<RealmResponse>(`/v2/organizations/${organizationId}/realms/${realmId}`, { data });
}

/**
 * Updates SSO realm groupMapping.
 */
export function updateGroupMappingRealmService({ realmId, organizationId }: RealmContext, data: UpdateRealmGroupMappingPayload) {
  return putRequest<RealmResponse>(`/v2/organizations/${organizationId}/realms/${realmId}/groupmapping`, { data });
}
