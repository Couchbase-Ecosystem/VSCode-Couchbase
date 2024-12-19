const nanoId = (t: number = 21) =>
  window.crypto.getRandomValues(new Uint8Array(t)).reduce((t, e) => {
    // eslint-disable-next-line no-nested-ternary, no-bitwise, no-cond-assign, no-param-reassign
    const r = (e &= 63) < 36 ? e.toString(36) : e < 62 ? (e - 26).toString(36).toUpperCase() : e < 63 ? '_' : '-';
    return `${t}${r}`;
  }, '');

export const uniqueId = (fallback?: string) => {
  if (window.crypto !== undefined) {
    return nanoId();
  }
  return fallback || '<id>';
};
