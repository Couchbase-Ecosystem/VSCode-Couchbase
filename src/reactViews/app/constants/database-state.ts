export const DATABASE_HEALTHY_STATE = {
  healthy: 'Healthy',
  draft: 'Draft',
  deploying: 'Deploying',
  scaling: 'Scaling',
  upgrading: 'Upgrading',
  peering: 'Peering',
  rebalancing: 'Rebalancing',
  destroying: 'Destroying',
  needsRedeployment: 'Needs Redeployment',
  'n/a': 'Unknown',
};
export type HealthyDatabaseState = keyof typeof DATABASE_HEALTHY_STATE;

export const DATABASE_UNHEALTHY_STATE = {
  unhealthy: 'Unhealthy',
  deployment_failed: 'Deployment Failed',
  scale_failed: 'Scaling Failed',
  destroy_failed: 'Destroy Failed',
  upgrade_failed: 'Upgrade Failed',
  peering_failed: 'Peering Failed',
  rebalance_failed: 'Rebalance Failed',
};
export type UnhealthyDatabaseState = keyof typeof DATABASE_UNHEALTHY_STATE;

export const DATABASE_LOADING_STATE = {
  deploying: 'Deploying',
  scaling: 'Scaling',
  upgrading: 'Upgrading',
  peering: 'Peering',
  rebalancing: 'Rebalancing',
  destroying: 'Destroying',
  turning_on: 'Turning On',
  turning_off: 'Turning Off',
  pausing: 'Pausing',
  resuming: 'Resuming',
};
export type LoadingDatabaseState = keyof typeof DATABASE_LOADING_STATE;

export type DatabaseLoadingState = 'success' | 'error' | 'loading';

export const DATABASE_NEUTRAL_STATE = {
  turned_off: 'Off',
  paused: 'Paused',
};
export type NeutralDatabaseState = keyof typeof DATABASE_NEUTRAL_STATE;

export const DATABASE_STATE = {
  ...DATABASE_HEALTHY_STATE,
  ...DATABASE_UNHEALTHY_STATE,
  ...DATABASE_LOADING_STATE,
  ...DATABASE_NEUTRAL_STATE,
};
export type DatabaseState = HealthyDatabaseState | UnhealthyDatabaseState | NeutralDatabaseState | LoadingDatabaseState;
