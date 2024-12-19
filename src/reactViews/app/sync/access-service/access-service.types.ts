import type { RbacListResponse, RbacResponse } from 'sync/response.types';

export type AccessType = 'read' | 'write' | 'read_write';
export type ProvisionedApiKeyPermissions = {
  bucket: string;
  scope?: string;
  access: AccessType;
};
export type ProvisionedApiKey = {
  createdAt: string;
  createdBy?: string;
  createdByUserID?: string;
  id: string;
  modifiedAt?: string;
  modifiedByUserID?: string;
  name: string;
  permissions: ReadWritePermissions;
};

export type ReadWritePermissions = {
  data_reader?: BucketPermissions;
  data_writer?: BucketPermissions;
};

export type BucketPermissions = {
  buckets?: BucketPermission[] | null;
};

export type UpdateProvisionedApiKeyPayload = {
  name: string;
  permissions: ReadWritePermissions;
};
export type CreateProvisionedApiKeyPayload = {
  name: string;
  password: string;
  permissions: ReadWritePermissions;
};

export type BucketPermission = {
  name: string;
  scopes?: BucketScopePermission[] | null;
};

export type BucketScopePermission = {
  name: string;
};

export type ProvisionedApiKeyResponse = RbacResponse<ProvisionedApiKey>;
export type ProvisionedApiKeyListResponse = RbacListResponse<ProvisionedApiKeyResponse>;

export type ServerlessApiKey = {
  id: string;
  access: string;
  secret?: string;
  userID: string;
  createdAt: string;
};

export type ServerlessApiKeyResponse = RbacResponse<ServerlessApiKey>;
export type ServerlessApiKeyListResponse = RbacListResponse<ServerlessApiKeyResponse>;

export type CreateServerlessApiKeyPayload = {
  tenantId: string;
  projectId: string;
};

export type OrganizationApiKey = {
  id: string;
  name: string;
  access: string;
  secret?: string;
  tenantId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  lastTimeUsed?: string;
  createdAt: string;
};

export type OrganizationApiKeyResponse = RbacResponse<OrganizationApiKey>;
export type OrganizationApiKeyListResponse = RbacListResponse<OrganizationApiKey>;

export type CreateOrganizationApiKeyPayload = {
  name: string;
  tenantId: string;
};
