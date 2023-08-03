import { PaginationSize } from 'components/data-grid/pagination/pagination.utils';

export type AnyContext =
  | ApiKeyContext
  | AppEndpointContext
  | AppServiceAllowedIpContext
  | AppServiceContext
  | BackupContext
  | BucketContext
  | DatabaseAllowedIpContext
  | DatabaseContext
  | InvitationContext
  | OrganizationContext
  | OrganizationUserContext
  | ProjectContext
  | ProjectUserContext
  | ProxyBucketContext
  | ProxyScopeContext
  | ProxyCollectionContext
  | RealmContext
  | ReplicationContext
  | UserContext;

export type UserContext = {
  userId: string;
};

export type InvitationContext = {
  invitationId: string;
};

export type OrganizationContext = {
  organizationId: string;
};

export type OrganizationUserContext = {
  organizationId: string;
  userId: string;
};

export type ProjectContext = {
  organizationId: string;
  projectId: string;
};

export type ProjectUserContext = {
  organizationId: string;
  projectId: string;
  userId: string;
};

export type DatabaseContext = {
  organizationId: string;
  projectId: string;
  databaseId: string;
};

export type DatabaseUserContext = {
  organizationId: string;
  projectId: string;
  databaseId: string;
  userId: string;
};

export type ApiKeyContext = {
  organizationId: string;
  projectId: string;
  databaseId: string;
  keyId: string;
};

export type DatabaseAllowedIpContext = {
  organizationId: string;
  projectId: string;
  databaseId: string;
  ipId: string;
};

export type ProxyContext = {
  databaseId: string;
};

export type ProxyBucketContext = {
  databaseId: string;
  bucketId: string;
};

export type ProxyScopeContext = {
  databaseId: string;
  bucketId: string;
  scopeId: string;
};

export type ProxyCollectionContext = {
  databaseId: string;
  bucketId: string;
  scopeId: string;
  collectionId: string;
};

export type BackupContext = {
  organizationId: string;
  projectId: string;
  databaseId: string;
  backupId: string;
};

export type BucketContext = {
  organizationId: string;
  projectId: string;
  databaseId: string;
  bucketId: string;
};

export type AppServiceContext = {
  organizationId: string;
  projectId: string;
  databaseId: string;
  appServiceId: string;
};

export type AppServiceEndpointContext = {
  organizationId: string;
  projectId: string;
  databaseId: string;
  appServiceId: string;
  appEndpointId: string;
};

export type AppServiceEndpointUserContext = AppServiceEndpointContext & {
  name: string;
};

export type AppRoleContext = {
  organizationId: string;
  projectId: string;
  databaseId: string;
  appServiceId: string;
  appEndpointId: string;
  appRoleId: string;
};

export type AppEndpointContext = {
  organizationId: string;
  projectId: string;
  databaseId: string;
  appServiceId: string;
  appEndpointId: string;
};

export type AppServiceAllowedIpContext = {
  organizationId: string;
  projectId: string;
  databaseId: string;
  appServiceId: string;
  allowedIpId: string;
};

export type ReplicationContext = {
  organizationId: string;
  projectId: string;
  databaseId: string;
  replicationId: string;
};

export type RealmContext = {
  organizationId: string;
  realmId: string;
};

export type EventContext = {
  organizationId: string;
  eventId: string;
};

export type TeamContext = {
  organizationId: string;
  teamId: string;
};

export type VpcContext = {
  organizationId: string;
  projectId: string;
  databaseId: string;
  vpcId: string;
};

export type PrivateEndpointContext = {
  organizationId: string;
  projectId: string;
  databaseId: string;
  privateEndpointId: string;
};

export type PaginationParams = {
  page: number;
  perPage: PaginationSize;
};

export type SortParams = {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
};

export type SelfManagedContext = {
  organizationId: string;
  projectId: string;
  databaseId: string;
  selfManagedName: string;
};
