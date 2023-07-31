export const APP_SERVICE_HEALTHY_STATE = {
  healthy: 'Normal',
} as const;
export type AppServiceHealthyState = keyof typeof APP_SERVICE_HEALTHY_STATE;

export const APP_SERVICE_WARNING_STATE = {
  destroying: 'Destroying',
  degraded: 'Degraded',
} as const;
export type AppServiceWarningState = keyof typeof APP_SERVICE_WARNING_STATE;

export const APP_SERVICE_UNHEALTHY_STATE = {
  deploymentFailed: 'Deployment Failed',
  destroyFailed: 'Destroying Failed',
  scaleFailed: 'Scaling Failed',
  upgradeFailed: 'Upgrade Failed',
} as const;
export type AppServiceUnhealthyState = keyof typeof APP_SERVICE_UNHEALTHY_STATE;

export const APP_SERVICE_NEUTRAL_STATE = {
  '': 'Unknown', //	Why do we have an unknown state?
  scaling: 'Scaling',
  upgrading: 'Upgrading',
  pending: 'Pending',
  deploying: 'Deploying',
} as const;
export type AppServiceNeutralState = keyof typeof APP_SERVICE_NEUTRAL_STATE;

export const APP_SERVICE_STATE = {
  ...APP_SERVICE_HEALTHY_STATE,
  ...APP_SERVICE_WARNING_STATE,
  ...APP_SERVICE_UNHEALTHY_STATE,
  ...APP_SERVICE_NEUTRAL_STATE,
} as const;

export type AppServiceState = keyof typeof APP_SERVICE_STATE;
