import { parseVersion } from './parse-version';

export const hasMinVersion = (minVersion: string) => {
  const min = parseVersion(minVersion);
  return (currentVersion?: string): boolean => {
    const current = parseVersion(currentVersion);
    if (!current || !min) {
      return false;
    }
    if (current.major > min.major) {
      return true;
    }
    if (min.major > current.major) {
      return false;
    }
    if (current.minor > min.minor) {
      return true;
    }
    if (min.minor > current.minor) {
      return false;
    }
    return current.patch >= min.patch;
  };
};
