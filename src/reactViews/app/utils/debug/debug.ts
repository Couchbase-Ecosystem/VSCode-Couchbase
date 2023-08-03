import { allowDebug } from './allow-debug';

export function debugLog(message?: any, ...optionalParams: any[]) {
  if (allowDebug()) {
    // eslint-disable-next-line no-console
    console.debug(message, ...optionalParams);
  }
}
export function errorLog(message?: any, ...optionalParams: any[]) {
  if (allowDebug()) {
    // eslint-disable-next-line no-console
    console.error(message, ...optionalParams);
  }
}
