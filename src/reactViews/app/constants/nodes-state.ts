export const NODE_HEALTHY_STATE = {
  Healthy: 'Healthy',
};
export type HealthyNodeState = keyof typeof NODE_HEALTHY_STATE;

export const NODE_UNHEALTHY_STATE = {
  Unhealthy: 'Unhealthy',
};
export type UnhealthyNodeState = keyof typeof NODE_UNHEALTHY_STATE;

export const NODE_LOADING_STATE = {
  Deploying: 'Deploying',
};
export type LoadingNodeState = keyof typeof NODE_LOADING_STATE;

export const NODE_STATE = {
  ...NODE_HEALTHY_STATE,
  ...NODE_UNHEALTHY_STATE,
  ...NODE_LOADING_STATE,
};
export type NodeState = keyof typeof NODE_STATE;
