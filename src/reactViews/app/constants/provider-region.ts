import type { Provider } from './provider';

/**
 * Available `AWS` regions and associated display names
 */
export const AWS_REGION = {
  'us-east-1': 'US East (N. Virginia)',
  'us-east-2': 'US East (Ohio)',
  'us-west-1': 'US West (N. California)',
  'us-west-2': 'US West (Oregon)',
  'ca-central-1': 'Canada (Central)',
  'eu-central-1': 'EU (Frankfurt)',
  'eu-west-1': 'EU (Ireland)',
  'eu-west-2': 'EU (London)',
  'eu-west-3': 'EU (Paris)',
  'eu-north-1': 'EU (Stockholm)',
  'eu-south-1': 'EU (Milan)',
  'ap-southeast-1': 'Asia Pacific (Singapore)',
  'ap-southeast-2': 'Asia Pacific (Sydney)',
  'ap-northeast-1': 'Asia Pacific (Tokyo)',
  'ap-northeast-2': 'Asia Pacific (Seoul)',
  'ap-south-1': 'Asia Pacific (Mumbai)',
  'ap-east-1': 'Asia Pacific (Hong Kong)',
  'ap-northeast-3': 'Asia Pacific (Osaka)',
  'af-south-1': 'Africa (Cape Town)',
  'me-south-1': 'Middle East (Bahrain)',
  'sa-east-1': 'South America (São Paulo)',
} as const;

export type AWSRegion = keyof typeof AWS_REGION;

/**
 * Available `AWS` serverless regions and associated display names
 */
export const AWS_SERVERLESS_REGION = {
  'us-east-1': 'US East (N. Virginia)',
} as const;

export type AWSServerlessRegion = keyof typeof AWS_SERVERLESS_REGION;

/**
 * Available `Azure` regions and associated display names
 */
export const AZURE_REGION = {
  eastus2: 'US East (Virginia 2)',
  eastus: 'US East (Virginia 1)',
  canadacentral: 'Canada (Central)',
  centralus: 'US Central (Iowa)',
  westus2: 'US West (Washington)',
  westus3: 'US West (Arizona)',
  francecentral: 'Europe (Paris)',
  germanywestcentral: 'Europe (Frankfurt)',
  northeurope: 'Europe (Ireland)',
  norwayeast: 'Europe (Norway)',
  uksouth: 'Europe (London)',
  westeurope: 'Europe (Netherlands)',
  swedencentral: 'Europe (Sweden)',
  australiaeast: 'Australia (New South Wales)',
  japaneast: 'Asia Pacific (Tokyo)',
  koreacentral: 'Asia Pacific (Seoul)',
  southeastasia: 'Asia Pacific (Singapore)',
  centralindia: 'India (Pune)',
  brazilsouth: 'Brazil (São Paulo)',
} as const;

export type AzureRegion = keyof typeof AZURE_REGION;

/**
 * Available `GCP` regions and associated display names
 */
export const GCP_REGION = {
  'asia-east1': 'Asia Pacific (Taiwan)',
  'asia-east2': 'Asia Pacific (Hong Kong)',
  'asia-northeast1': 'Asia Pacific (Tokyo)',
  'asia-northeast2': 'Asia Pacific (Osaka)',
  'asia-northeast3': 'Asia Pacific (Seoul)',
  'asia-south1': 'Asia Pacific (Mumbai)',
  'asia-south2': 'Asia Pacific (Delhi)',
  'asia-southeast1': 'Asia Pacific (Singapore)',
  'asia-southeast2': 'Asia Pacific (Indonesia)',
  'australia-southeast1': 'Australia (Sydney)',
  'australia-southeast2': 'Australia (Melbourne)',
  'europe-central2': 'Europe (Warsaw)',
  'europe-north1': 'EU North (Hamina)',
  'europe-west1': 'EU West (St. Ghislain)',
  'europe-west2': 'EU West (London)',
  'europe-west3': 'EU West (Frankfurt)',
  'europe-west4': 'EU West (Eemshaven)',
  'europe-west6': 'EU West (Zurich)',
  'europe-west8': 'EU West (Milan)',
  'northamerica-northeast1': 'Canada (Montréal)',
  'northamerica-northeast2': 'Canada (Toronto)',
  'southamerica-east1': 'Brazil (São Paulo)',
  'southamerica-west1': 'Chile (Santiago)',
  'us-east1': 'US East (South Carolina)',
  'us-east4': 'US East (Virginia)',
  'us-west1': 'US West (Oregon)',
  'us-west2': 'US West (Los Angeles)',
  'us-west3': 'US West (Utah)',
  'us-west4': 'US West (Las Vegas)',
  'us-central1': 'US Central (Iowa)',
  'us-central2': 'US Central (Oklahoma)',
};

export type GCPRegion = keyof typeof GCP_REGION;

/**
 * Available cloud infrastructure regions and associated display names
 */
export const PROVIDER_REGION: {
  [key in Provider]: typeof AWS_REGION | typeof AZURE_REGION | typeof GCP_REGION;
} = {
  aws: AWS_REGION,
  azure: AZURE_REGION,
  gcp: GCP_REGION,
};

export type ProviderRegion = AWSRegion | AzureRegion | GCPRegion;

/**
 * Available cloud infrastructure regions and associated display names
 */
export const SERVERLESS_PROVIDER_REGION: {
  aws: typeof AWS_SERVERLESS_REGION;
} = {
  aws: AWS_SERVERLESS_REGION,
};

export type ServerlessProviderRegion = AWSServerlessRegion;

// the list is taken from: https://cloud.google.com/network-tiers/docs/overview#regions_supporting_standard_tier
export const SUPPORTED_GCP_APPSERVICE_REGIONS: ProviderRegion[] = [
  'asia-east1',
  'asia-east2',
  'asia-northeast1',
  'asia-northeast3',
  'asia-south1',
  'asia-southeast1',
  'asia-southeast2',
  'australia-southeast1',
  'us-west1',
  'us-west2',
  'us-west3',
  'us-west4',
  'us-central1',
  'us-east1',
  'us-east4',
  'northamerica-northeast1',
  'southamerica-east1',
  'europe-north1',
  'europe-west1',
  'europe-west2',
  'europe-west3',
  'europe-west4',
  'europe-west6',
];

export const SUPPORTED_VIRTUAL_NETWORK_REGIONS: AWSRegion[] = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'af-south-1',
  'ap-east-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ca-central-1',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-south-1',
  'eu-west-3',
  'eu-north-1',
  'me-south-1',
  'sa-east-1',
];

export const UNSUPPORTED_AZURE_ULTRA_DISK_REGIONS: AzureRegion[] = ['brazilsouth', 'centralindia', 'norwayeast', 'koreacentral'];
