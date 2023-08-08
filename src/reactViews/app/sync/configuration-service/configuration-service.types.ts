import { AWSInstancesName } from 'constants/aws-instances';
import { Provider } from 'constants/provider';
import { ProviderRegion } from 'constants/provider-region';
import type { CapellaService, ServerService } from 'constants/service';
import type { DatabaseServicePlans } from 'sync/database-service';
import type { RbacListResponse, RbacResponse } from 'sync/response.types';

export type DatabaseStorageOption = {
  key: string;
  requirements: {
    minSize: number;
    maxSize: number;
    minIops?: number;
    maxIops?: number;
  };
};

export type DatabaseStorageType = {
  key: string;
  size: number;
  iops: {
    enabled: boolean;
    quantity?: number;
  };
};

export type DatabaseDeploymentMethod = 'hosted' | 'inVpc' | 'serverless';

export type DatabaseSpecData = {
  specs: DatabaseSpec[];
  newSpecOptions?: {
    services: DatabaseServiceOption[];
    availableCompute: {
      category?: string;
      class?: string;
      compute: {
        key: string;
        vcpus: string;
        memory: string;
      };
      availableStorage: DatabaseStorageOption[];
    }[];
    eligibility: {
      enabled: boolean;
      messaging?: string;
    };
  };
};

export type DatabaseSpecResponse = RbacResponse<DatabaseSpecData>;

// ServiceOption
export type DatabaseServiceOption = {
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
    restrictedToPlans?: DatabaseServicePlans[];
  };
};

// Spec
export type DatabaseSpec = {
  provider: Provider;
  count: number;
  services: ServerService[];
  compute: AWSInstancesName;
  computeOptions: {
    category?: string;
    class?: string;
    compute: {
      key: string;
      vcpus: string;
      memory: string;
    };
    availableStorage: DatabaseStorageOption[];
  }[];
  serviceOptions?: DatabaseServiceOption[];
  disk: DatabaseStorage;
  diskAutoScaling: DiskAutoScaling;
};

export type UpdateDatabaseSpecPayload = {
  specs: {
    compute: { type: AWSInstancesName };
    count: number;
    disk: {
      type: string;
      sizeInGb: number;
      iops?: number;
    };
    diskAutoScaling: {
      enabled: boolean;
    };
    services: { type: ServerService }[];
  }[];
};

export type DatabaseUISpec = DatabaseSpec & { id: string };

export type DatabaseUISpecData = {
  specs: DatabaseUISpec[];
  newSpecOptions?: {
    services: DatabaseServiceOption[];
    availableCompute: {
      category?: string;
      class?: string;
      compute: {
        key: string;
        vcpus: string;
        memory: string;
      };
      availableStorage: DatabaseStorageOption[];
    }[];
    eligibility: {
      enabled: boolean;
      messaging?: string;
    };
  };
};

export type DatabaseUISpecResponse = RbacResponse<DatabaseUISpecData>;
export type DatabaseAvailableSpecResponse = RbacListResponse<DatabaseUISpec>;

export type DatabaseStorage = {
  type: string;
  sizeInGb: number;
  iops?: number;
  options?: DatabaseStorageOption[];
};

export type DiskAutoScaling = {
  enabled: boolean;
};

export type DatabasePlanCost = {
  plan: DatabaseServicePlans;
  creditsPerHour: string;
};

export type DatabasePackageOption = {
  plan: DatabaseServicePlans;
  creditsPerHour: string;
  eligible: boolean;
  reasoning?: string;
  timezones?: DatabaseTimeZone[];
};

export type DatabaseTimeZone = {
  key: string;
  description: string;
};

export type DatabaseSupportPlanGroup = {
  key: 'basic' | 'essentials';
  options: {
    key: DatabaseServicePlans;
  }[];
  timezones: DatabaseTimeZone[];
};

export type DatabaseSpecificationOptions = {
  key: Provider;
  displayName: string;
  regions: {
    key: ProviderRegion;
    displayName: string;
    globalRegion: string;
  }[];
  customSizing: {
    services: {
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
    availableCompute: {
      category?: string;
      class?: string;
      compute: {
        key: string;
        vcpus: string;
        memory: string;
      };
      availableStorage: DatabaseStorageOption[];
    }[];
    eligibility: {
      enabled: boolean;
      messaging?: string;
    };
  };
  categories: {
    id: string;
    title: string;
    subtitle: string;
    descriptions: string[];
    templates: {
      specs: {
        services: {
          key: CapellaService;
          displayName: string;
          enabled: boolean;
        }[];
        compute: {
          key: string;
          vcpus: string;
          memory: string;
        };
        count: number;
        storage: DatabaseStorageType;
      }[];
    }[];
    eligibility: {
      enabled: boolean;
      messaging?: string;
      restrictedToPlans?: DatabaseServicePlans[];
    };
  }[];
};

export type DatabaseDeploymentOptions = {
  deliveryMethods: DatabaseDeliveryMethods[];
  projects?: {
    id: string;
    name: string;
  }[];
  plans?: {
    key: 'basic' | 'essentials';
    options: {
      key: DatabaseServicePlans;
    }[];
  }[];
  trialCluster?: unknown;
  cidrBlacklist: string[];
  suggestedCidr?: string;
};

export type DatabaseDeliveryMethods = {
  method: DatabaseDeploymentMethod;
  providers: DatabaseSpecificationOptions[];
  availabilityZones: {
    key: 'single' | 'multi';
    eligibility: {
      enabled: boolean;
      messaging?: string;
      restrictedToPlans?: DatabaseServicePlans[];
    };
  }[];
};

export type DeploymentPackageOptionResponse = DatabasePackageOption[];

export type DatabaseDeploymentCostPayload = {
  specs: {
    count: number;
    services: string[];
    compute: string;
    disk: {
      type: string;
      sizeInGb: number;
      iops?: number;
    };
  }[];
  deliveryMethod: string;
  provider: string;
  region: string;
};

export type DatabaseDeploymentCost = {
  plan: DatabaseServicePlans;
  creditsPerHour: string;
  eligible: boolean;
  reasoning?: string;
  timezones?: {
    key: string;
    description: string;
  }[];
};

export type DatabaseDeploymentCostResponse = DatabaseDeploymentCost[];
