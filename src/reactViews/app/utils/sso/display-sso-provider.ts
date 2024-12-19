import { SSO_PROVIDER_DISPLAY, SSOProvider } from 'constants/provider';

/**
 * Display information for SSO providers, for use in tables and other use cases.
 * @param provider - Lower-case abbreviation of the IDP.
 */
export function displaySSOProvider(provider: SSOProvider) {
  return SSO_PROVIDER_DISPLAY[provider];
}
