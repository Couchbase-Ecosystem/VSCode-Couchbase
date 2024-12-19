import { hasWindowObject, isTestEnvironment } from './utils';

export const ALLOW_FOR_ALL_ENVIRONMENTS = false;

export function allowDebug() {
  if (!hasWindowObject()) {
    return ALLOW_FOR_ALL_ENVIRONMENTS;
  }

  if (isTestEnvironment()) {
    return false;
  }

  if (window.location.href.indexOf('localhost') >= 0) {
    return true;
  }

  if (window.location.href.indexOf('nonprod') >= 0) {
    return true;
  }

  return ALLOW_FOR_ALL_ENVIRONMENTS;
}
