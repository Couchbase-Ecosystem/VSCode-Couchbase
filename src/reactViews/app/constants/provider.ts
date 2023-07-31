import { IconName } from 'components/icon';

/**
 * Available cloud infrastructure providers.
 */
export const PROVIDER = { aws: 'aws', azure: 'azure', gcp: 'gcp' } as const;
export type Provider = (typeof PROVIDER)[keyof typeof PROVIDER];

/**
 * @typedef {Object} ProviderDisplay
 * @property {string} name - The display name for the provider
 * @property {IconName} icon - The icon ID for the provider logo
 */
export type ProviderDisplay = {
  name: string;
  icon: IconName;
};

/**
 * `name` and `icon` display information for each cloud infrastructure provider.
 */
export const PROVIDER_DISPLAY: { [key in Provider]: ProviderDisplay } = {
  aws: {
    name: 'AWS',
    icon: 'logo-aws',
  },
  azure: {
    name: 'Azure',
    icon: 'logo-azure',
  },
  gcp: {
    name: 'Google Cloud',
    icon: 'logo-gcp',
  },
};

/**
 * Available cloud infrastructure providers.
 */
export const SSO_PROVIDER = {
  Okta: 'Okta',
  Azure: 'Azure',
  Ping: 'Ping',
  CyberArk: 'CyberArk',
} as const;
export type SSOProvider = (typeof SSO_PROVIDER)[keyof typeof SSO_PROVIDER];

export const SSO_PROVIDER_DISPLAY: { [key in SSOProvider]: ProviderDisplay } = {
  Okta: {
    name: 'Okta',
    icon: 'okta-circle',
  },
  Azure: {
    name: 'Azure Active Directory',
    icon: '10221-icon-service-Azure-Active-Directory',
  },
  Ping: {
    name: 'Ping',
    icon: 'icon-service-ping-identity',
  },
  CyberArk: {
    name: 'CyberArk',
    icon: 'icon-service-cyberark',
  },
};
