import type { AppServiceState } from 'constants/app-service-state';
import type { DatabaseProvider, DatabaseServicePlans } from 'sync/database-service';
import type { RbacListResponse, RbacResponse } from 'sync/response.types';

export type AppService = {
  id: string;
  name: string;
  tenantId: string;
  project: {
    id: string;
    name: string;
  };
  cluster: {
    id: string;
    name: string;
  };
  config: {
    baseHostname: string;
    scale: {
      min: number;
      max: number;
    };
    compute: {
      type: string;
      cpu: number;
      memoryInGb: number;
    };
    version: {
      imageId: string;
      release: string;
    };
    provider: string;
    region: string;
    metricsURL: string;
    encryption: {
      providerId: string;
    };
    dnsZone: {
      name: string;
      tld: string;
      id: string;
      accountNo: string;
    };
  };
  status: {
    state: AppServiceState;
  };
  createdBy: string;
  createdAt: string;
  providerInfo: DatabaseProvider;
};

export type AppServiceResponse = RbacResponse<AppService>;
export type AppServiceCreateResponse = { id: string };
export type AppServiceListResponse = RbacListResponse<AppServiceResponse>;

export type CreateAppServicePayload = {
  name: string;
  clusterId: string;
  desired_capacity: number;
  compute: {
    type: string;
  };
};
export type UpdateAppServicePayload = Omit<CreateAppServicePayload, 'name'>;

export type AppServiceEndpoint = {
  ID?: string;
  name?: string;
  delta_sync?: boolean;
  import_filter?: string;
  sync?: string;
  bucket?: string;
  offline?: boolean;
  anonymous?: boolean;
  basic_auth?: boolean;
  oidc?: {
    issuer: string;
    client_id?: string;
    discovery_url?: string;
    user_prefix?: string;
    username_claim: string;
    register: boolean;
  };
};

export type AppServiceNodeCount = AppServiceOptions['node_counts'];

export type AppServiceOptions = {
  providers: {
    key: string;
    displayName: string;
    regions: {
      key: string;
      displayName: string;
      globalRegion: string;
    }[];
    compute_options: {
      key: string;
      vcpus: string;
      memory: string;
    }[];
  }[];
  projects: {
    id: string;
    name: string;
  }[];
  node_counts: {
    min_count: number;
    max_count: number;
  };
};

export type AppServiceOptionsResponse = RbacResponse<AppServiceOptions>;

export type AppServiceSpec = {
  current_specs: {
    node_count: number;
    compute: {
      key: string;
      vcpus: string;
      memory: string;
    };
  };
  scale_options: {
    node_counts: {
      min_count: number;
      max_count: number;
    } | null;
    compute:
      | {
          key: string;
          vcpus: string;
          memory: string;
        }[]
      | null;
  };
};

export type AppServiceSpecResponse = RbacResponse<AppServiceSpec>;

export type AppServiceDeploymentOptions = {
  providers: AppServiceProvider[];
  projects: {
    id: string;
    name: string;
  }[];
  node_counts: {
    min_count: number;
    max_count: number;
  };
};

export type AppServiceProvider = {
  key: 'aws' | 'gcp';
  displayName: 'AWS' | 'GCP';
  regions: {
    key: string;
    displayName: string;
    globalRegion: string;
  }[];
  compute_options: AppServiceComputeOptions[];
};

export type AppServiceComputeOptions = {
  key: string;
  vcpus: string;
  memory: string;
};

export type AppServiceEndpointCert = {
  Cert: string;
};

export type AppServiceDeploymentCostPayload = {
  compute: string;
  provider: string;
  region: string;
  scale: number;
};

export type AppServicePackageOption = {
  plan: DatabaseServicePlans;
  creditsPerHour: string;
  eligible: boolean;
  reasoning?: string;
  timezones?: {
    key: string;
    description: string;
  }[];
};

export type AppServicePackageOptionResponse = AppServicePackageOption[];

export type AppServiceDeploymentCost = {
  plan: DatabaseServicePlans;
  creditsPerHour: string;
  eligible: boolean;
  reasoning?: string;
  timezones?: {
    key: string;
    description: string;
  }[];
};

export type AppServiceDeploymentCostResponse = AppServiceDeploymentCost[];

export type AppEndpointConnect = {
  ID: string;
  adminURL: string;
  metricsURL: string;
  publicURL: string;
};

export type AppEndpointConnectResponse = RbacResponse<AppEndpointConnect>;

export type CreateAppEndpointPayload = {
  name: string;
  bucket: string;
  sync: string;
  delta_sync: boolean;
  import_filter: string;
};

export type AppEndpoint = {
  ID: string;
  name: string;
  delta_sync?: boolean;
  import_filter?: string;
  sync?: string;
  bucket: string;
  offline?: boolean;
  anonymous?: boolean;
  basic_auth?: boolean;
  oidc?: {
    issuer: string;
    client_id?: string;
    discovery_url?: string;
    user_prefix?: string;
    username_claim: string;
    register: boolean;
  };
};

// `NewAppEndpoint` is only mocked at this moment - it is extra types which are not getting from API and which are used in app-endpoint.tsx
export type NewAppEndpoint = {
  ID: string;
  name: string;
  status: string;
  online?: boolean;
  offline?: boolean;
  sync?: boolean;
  bucket: string;
  scope: string;
  collections_count: number;
  createdBy: string;
  createdAt: string;
};

export type ToggleAnonymousBasicauthPayload = {
  enable: boolean;
};

export type AppEndpointOidcPayload = {
  issuer: string;
  client_id: string;
  discovery_url: string;
  user_prefix: string;
  username_claim: string;
  register: boolean;
};

export type AdminUser = {
  id: string;
  tenantId: string;
  projectId: string;
  clusterId: string;
  name: string;
  bucket: string;
  createdByUserID: string;
  upsertedByUserID: string;
  createdAt: string;
  upsertedAt: string;
  modifiedByUserID: string;
  modifiedAt: string;
  createdBy: string;
  version: number;
};

export type AppUser = {
  name: string;
  admin_channels?: string[];
  admin_roles?: string[];
  all_channels?: string[];
  disabled?: boolean;
  password?: string;
  roles?: string[];
};

export type CreateAppUserPayload = {
  name: string;
  password: string;
  admin_channels: string[];
  admin_roles: string[];
  disabled: boolean;
};

export type UpdateAppUserPayload = {
  name: string;
  admin_channels?: string[];
  admin_roles?: string[];
  all_channels?: string[];
  roles?: string[];
  disabled?: boolean;
  password?: string;
};

export type Resync = {
  status: string;
  start_time: string;
  last_error: string;
  docs_changed: number;
  docs_processed: number;
};

export type CreateAdminUserPayload = {
  name: string;
  password: string;
};

export type ResyncRequest = RbacResponse<Resync>;

export type AppEndpointResponse = RbacResponse<AppEndpoint>;
export type AppEndpointListResponse = RbacListResponse<AppEndpointResponse>;

export type AdminUserResponse = RbacResponse<AdminUser>;
export type AdminUserListResponse = RbacListResponse<AdminUserResponse>;

export type AppEndpointSync = {
  sync: string;
};

export type AppEndpointResyncPayload = {
  action: string;
};

export type AppServiceEndpointCertResponse = RbacResponse<AppServiceEndpointCert>;

export type AppEndpointSyncResponse = RbacResponse<AppEndpointSync>;

export type AppUserResponse = RbacResponse<AppUser>;
export type AppUserListResponse = RbacListResponse<AppUserResponse>;
