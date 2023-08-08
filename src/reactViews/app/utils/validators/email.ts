/**
 * validateEmail applies a regex pattern match in addition to some
 * specific checks for signs a domain is known to be bad.
 *
 * ref: https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
 *
 * @param email
 */
export const validateEmail = (email: string) => {
  const normalized = String(email).toLowerCase();
  if (
    !normalized.match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
  ) {
    return false;
  }

  const explicitChecks = ['@-', '-.', '.-', '@example.'];

  for (let i = 0; i < explicitChecks.length; i++) {
    if (normalized.includes(explicitChecks[i])) {
      return false;
    }
  }
  return true;
};
