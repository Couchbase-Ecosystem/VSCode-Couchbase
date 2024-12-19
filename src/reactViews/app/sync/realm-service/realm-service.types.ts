import { RbacListResponse, RbacResponse } from 'sync/response.types';

export type RealmIDPStandard = 'SAML 2.0';
export type RealmIDPVendor = 'Okta' | 'Azure' | 'Ping' | 'CyberArk';

export type CreateRealmPayload = {
  metadataXML?: string;
  connectionOptionsSAML?: {
    signingCertificate: string;
    signInEndpoint: string;
  };
  standard: RealmIDPStandard;
  vendor: RealmIDPVendor;
  defaultTeamId: string;
  disableGroupMapping: boolean;
};

export type CreateRealmResponse = {
  realmName: string;
  idpSettings: {
    callbackURL: string;
    entityId: string;
    certificateURL: string;
  };
};

export type Realm = {
  id: string;
  name: string;
  tenantId: string;
  identityProviderConnection: {
    id: string;
    standard: RealmIDPStandard;
    vendor: RealmIDPVendor;
    settings: {
      callbackURL: string;
      entityId: string;
      certificateURL: string;
    };
  };
  groupMapping: { disabled: boolean } | null;
  defaultTeamId: string;
  defaultTeamName: string;
  createdByUserName: string;
  createdByUserID: string;
  upsertedByUserID: string;
  createdAt: string;
  upsertedAt: string;
  modifiedByUserID: string;
  modifiedAt: string;
  version: number;
};

export type UpdateRealmDefaultTeamPayload = {
  defaultTeamId: string;
};

export type UpdateRealmGroupMappingPayload = {
  disabled: boolean;
};

export type DeleteRealmPayload = {
  keepUsers: boolean;
};

export type RealmResponse = RbacResponse<Realm>;
export type RealmListResponse = RbacListResponse<RealmResponse>;
