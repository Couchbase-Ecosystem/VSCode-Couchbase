export type Version = {
  major: number;
  minor: number;
  patch: number;
};

/**
 * Takes a possible string value and returns a the parsed number or zero.
 */
const asNumber = (inputString?: string | null): number => {
  if (!inputString) {
    return 0;
  }
  const num = parseInt(inputString, 10);
  if (Number.isNaN(num)) {
    return 0;
  }
  return num;
};

const enterprise = 'enterprise-';

export const parseVersion = (versionStr?: string): Version => {
  if (!versionStr) {
    return { major: 0, minor: 0, patch: 0 };
  }
  const semverRegex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gm;

  const versionRegex =
    /* eslint-disable no-useless-escape */
    /^(0|(?:[1-9]\d*))(?:\.(0|(?:[1-9]\d*))(?:\.(0|(?:[1-9]\d*)))?(?:\-([\w][\w\.\-_]*))?)?$/gm;

  let str = versionStr;
  if (str.startsWith(enterprise)) {
    str = str.slice(enterprise.length);
  }
  let match = semverRegex.exec(str);

  // when match is `null`, the version provided is not a valid semver (ex: 7.1)
  if (match === null) {
    match = versionRegex.exec(str);
  }

  const major = asNumber(match && match[1]);
  const minor = asNumber(match && match[2]);
  const patch = asNumber(match && match[3]);

  return {
    major,
    minor,
    patch,
  };
};
