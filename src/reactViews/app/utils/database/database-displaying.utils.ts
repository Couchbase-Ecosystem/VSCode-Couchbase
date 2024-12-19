import {
  DATABASE_HEALTHY_STATE,
  DATABASE_LOADING_STATE,
  DATABASE_NEUTRAL_STATE,
  DATABASE_UNHEALTHY_STATE,
  DatabaseState,
  HealthyDatabaseState,
  UnhealthyDatabaseState,
} from 'constants/database-state';
import { Provider, PROVIDER_DISPLAY } from 'constants/provider';
import { PROVIDER_REGION, ProviderRegion } from 'constants/provider-region';
import { Status } from 'sync/backup-service';

export const databaseStateToStatus = (state: DatabaseState): Status => {
  if (state in DATABASE_LOADING_STATE) {
    return 'loading';
  }

  if (state in DATABASE_HEALTHY_STATE) {
    return 'success';
  }

  if (state in DATABASE_NEUTRAL_STATE) {
    return 'default';
  }

  if (state in DATABASE_UNHEALTHY_STATE) {
    return 'error';
  }

  //	If state is unknown, always return 'loading';
  return 'loading';
};

export const displayAvailability = (singleAz?: boolean) => {
  switch (singleAz) {
    case true:
      return 'Single';
    case false:
      return 'Multiple';
    default:
      return '-';
  }
};

type DisplayDatabaseState = {
  value: string;
  healthy: boolean;
};

/**
 * Provides display text for a database state, also returns whether the state is `healthy` or `unhealthy` for traffic light elements.
 * @param {DatabaseState} state
 */
export function displayDatabaseState(state: DatabaseState): DisplayDatabaseState {
  if (Object.keys(DATABASE_HEALTHY_STATE).includes(String(state))) {
    return {
      value: DATABASE_HEALTHY_STATE[state as HealthyDatabaseState],
      healthy: true,
    };
  }
  return {
    value: DATABASE_UNHEALTHY_STATE[state as UnhealthyDatabaseState],
    healthy: false,
  };
}

/**
 * Display information for the cloud providers, for use in tables and other use cases.
 * @param provider - Lower-case abbreviation of the cloud provider.
 *
 * @returns Object containing the display `name` and `icon` ID for a cloud provider.
 */
export function displayProvider(provider: Provider) {
  return PROVIDER_DISPLAY[provider];
}

/**
 * Display information for the cloud providers, for use in tables and other use cases.
 * @param provider - Lower-case abbreviation of the cloud provider.
 * @param region - provider region
 *
 * @returns Object containing the display `name` and `logo` icon ID for a cloud provider.
 */
export function displayRegion(provider: Provider, region: ProviderRegion) {
  return (PROVIDER_REGION[provider] as object)[region as keyof object] as ProviderRegion;
}
