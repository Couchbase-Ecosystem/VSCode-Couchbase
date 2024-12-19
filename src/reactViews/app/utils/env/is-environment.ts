import { isDev } from './is-dev';

const Environments = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  STAGE: 'stage',
  LOCALHOST: 'localhost',
  SANDBOX: 'sandbox',
  PREVIEW: 'preview',
} as const;

export type Environment = (typeof Environments)[keyof typeof Environments];

export function detect(origin: string): Environment {
  switch (origin) {
    case 'cloud.couchbase.com':
      return Environments.PRODUCTION;

    case 'preview.cloud.couchbase.com':
      return Environments.PREVIEW;

    case 'stage.nonprod-project-avengers.com':
    case 'beta.nonprod-project-avengers.com':
      return Environments.STAGE;

    case 'dev.nonprod-project-avengers.com':
    case 'ui.nonprod-project-avengers.com':
    case 'alpha.nonprod-project-avengers.com':
      return Environments.DEVELOPMENT;

    case 'localhost':
      return Environments.LOCALHOST;

    default:
      if (origin.startsWith('ui.sbx-') && origin.endsWith('.nonprod-project-avengers.com')) {
        return Environments.SANDBOX;
      }

      return Environments.DEVELOPMENT;
  }
}

export function getEnvironment() {
  return detect(window.location.hostname);
}

export function isProductionEnvironment() {
  return getEnvironment() === Environments.PRODUCTION;
}

export function isPreviewEnvironment() {
  return getEnvironment() === Environments.PREVIEW;
}

export function isStageEnvironment() {
  return getEnvironment() === Environments.STAGE;
}

export function isDevelopmentEnvironment() {
  return getEnvironment() === Environments.DEVELOPMENT;
}

export function isNonProdEnvironment() {
  return getEnvironment() !== Environments.PRODUCTION;
}

export function isSandboxEnvironment() {
  return getEnvironment() === Environments.SANDBOX;
}

export function isLocalhostEnvironment() {
  // To help reduce the chance of spoofing localhost on production through some localhost trickery
  // we will also check to see if process.env.DEV is true. This value should be false in any
  // real build.
  return getEnvironment() === Environments.LOCALHOST && isDev();
}
