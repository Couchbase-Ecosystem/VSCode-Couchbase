/**
 * @remarks
 * Temporary function to fix malformed URI requests.
 * https://couchbasecloud.atlassian.net/browse/SURF-3165
 *
 * @see
 * V1 Reference.
 * /cp-ui/src/domain/requests/proxy.ts
 */
export function doubleEncode(value: string) {
  return encodeURIComponent(encodeURIComponent(value));
}
