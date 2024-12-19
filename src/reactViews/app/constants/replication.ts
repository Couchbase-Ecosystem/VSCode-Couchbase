export const REPLICATION_DIRECTION = {
  'one-way': 'One-way',
  'two-way': 'Two-way',
};

export const REPLICATION_STATUS = {
  paused: 'Paused',
  pausing: 'Pausing',
  pending: 'Pending',
  failed: 'Failed',
  running: 'Running',
};

export const REPLICATION_PRIORITY = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const REPLICATION_SELF_MANAGED_ERROR = {
  RC_INIT: 'The connection is still starting up',
  RC_OK: 'The connection is good',
  RC_AUTH_ERROR: 'An authentication error has occurred',
  RC_AUTH_ERR: 'An authentication error has occurred',
  RC_DEGRADED: 'One or more nodes has connectivity issues',
  RC_ERROR: 'No node is responding',
};
