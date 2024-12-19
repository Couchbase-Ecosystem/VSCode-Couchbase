import { AWSInstancesName } from 'constants/aws-instances';
import { DatabaseState } from 'constants/database-state';
import { Provider } from 'constants/provider';
import { ProviderRegion } from 'constants/provider-region';
import { CapellaServiceName, ServerService } from 'constants/service';
import { RbacListResponse, RbacResponse } from 'sync/response.types';

export type DatabaseStatusState = {
  status: {
    state: DatabaseState;
    stateEnteredAt?: string;
  };
};

export type Database = {
  id: string;
  tenantId: string;
  cloudId?: string;
  name: string;
  package?: {
    timezone: 'PT' | 'GMT' | 'ET' | 'IST';
    type: DatabaseServicePlans;
  };
  project: {
    id: string;
    name: string;
  };
  config: {
    architecture: DatabaseArchitecture;
    customImports: boolean;
    version?: string;
    singleAz: boolean;
  };
  provider: DatabaseProvider;
  connect: {
    dataApi?: string;
    srv?: string;
  };
  status: {
    state: DatabaseState;
    stateEnteredAt: string;
  };
  playgroundDisabled: boolean;
  createdBy: string;
  createdAt: string;
  description?: string;
  version?: string;
  appService?: {
    id: string;
    name: string;
  };
  // inVPC database doesn't have services
  services?: {
    count: number;
    services: {
      type: ServerService;
      memoryAllocationInMb: number;
    }[];
    compute: {
      type: string;
      cpu: number;
      memoryInGb: number;
    };
    disk: {
      type: string;
      sizeInGb: number;
      iops?: number;
    };
  }[];
};

export type DatabaseResponse = RbacResponse<Database>;
export type DatabaseListResponse = RbacListResponse<DatabaseResponse>;

export type CreateDatabaseResponse = {
  id: string;
};

export type CreateServerlessDatabasePayload = {
  tenantID: string;
  projectID: string;
  name: string;
  provider: Provider;
  region: string;
};

export type CreateDatabasePayload = {
  cloudId?: string;
  projectId: string;
  provider: string;
  name: string;
  region: string;
  cidr: string;
  singleAZ?: boolean;
  timezone: string;
  server?: string;
  plan: string;
  description?: string;
  specs: {
    count: number;
    services: ServerService[];
    compute: AWSInstancesName;
    serviceOptions?: {
      service: {
        key: ServerService;
        displayName: string;
        enabled: boolean;
      };
      requirements: {
        required: boolean;
        min: number;
      };
      eligibility: {
        enabled: boolean;
        messaging?: string;
        restrictedToPlans?: DatabaseServicePlans[];
      };
    }[];
    disk: {
      type: string;
      sizeInGb: number;
      iops?: number;
      options?: {
        /** Storage class name, e.g. 'gp3' */
        key: string;
        requirements: {
          minSize: number;
          maxSize: number;
          /**
           * Minimum number of IOPS required for this storage class
           * if missing, IOPS is not configurable for this storage class
           * */
          minIops?: number;
          maxIops?: number;
        };
      }[];
    };
  }[];
};

export type UpdateDatabasePayload = {
  name: string;
  description?: string;
};

export type TogglePlaygroundPayload = {
  disable: boolean;
};

export type UpdateDatabasePlanPayload = {
  package: string;
  timezone: string;
};

export type DeployTrialDatabasePayload = {
  provider: Provider;
  region: ProviderRegion;
  deliveryMethod: 'hosted';
  cidr: string;
};

export type HostedProvider = {
  deliveryMethod: 'hosted';
} & DatabaseProviderInformation;

export type InVpcProvider = {
  deliveryMethod: 'inVpc';
  cloudId?: string;
  cloudName?: string;
} & DatabaseProviderInformation;

export type PartialInVpcProvider = {
  deliveryMethod: 'inVpc';
  cloudId?: string;
  cloudName?: string;
};

export type OnPremProvider = {
  deliveryMethod: 'onPrem';
};

export type ServerlessProvider = {
  deliveryMethod: 'serverless';
} & DatabaseProviderInformation;

export type DatabaseServicePlans = 'Basic' | 'Developer Pro' | 'Enterprise';
export type DatabaseArchitecture = 'G1' | 'G2' | 'Serverless' | 'n/a';
export type DatabaseProviderInformation = {
  name: Provider;
  region: ProviderRegion;
};
export type DatabaseProvider = HostedProvider | InVpcProvider | PartialInVpcProvider | OnPremProvider | ServerlessProvider;

export type CreateServerlessResponse = {
  databaseId: string;
};

export type AccessibleDatabase = {
  id: string;
  name: string;
  projectId: string;
  architecture: DatabaseArchitecture;
};

export type DatabaseNode = {
  id: string;
  tenantId: string;
  projectId: string;
  clusterId: string;
  hostname: string;
  services: CapellaServiceName[];
  stats: {
    cpu: number;
    memory: number;
    diskUsed: number;
    items: {
      active: number;
      replica: number;
    };
  };
  status: {
    state: DatabaseNodeStatus;
    reasoning?: string;
  };
};

export type DatabaseServices = {
  compute: {
    type: string;
    cpu: number;
    memoryInGb: number;
  };
  count: number;
  disk: {
    type: string;
    iops?: number;
    memoryInGb?: number;
  };
  services: {
    type: ServerService;
    memoryAllocationInGb?: number;
  }[];
};

export type Job = {
  data: {
    clusterId: string;
    clusterName: string;
    projectId: string;
    tenantId: string;
    jobType: string;
    startTime: string;
    currentStep: string;
    completionPercentage: number;
    initiatedBy: string;
    jobResourceType: string;
  };
};

export type DatabaseCosts = {
  offCreditsPerHour: string;
  onCreditsPerHour: string;
};

export type JobResponse = RbacResponse<Job[]>;

export type DatabaseNodeStatus = 'Healthy' | 'Unhealthy' | 'Deploying';

export type DatabaseNodeResponse = RbacResponse<DatabaseNode>;
export type DatabaseNodeListResponse = RbacListResponse<DatabaseNodeResponse>;
