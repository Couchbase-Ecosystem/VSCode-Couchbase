export function hasWindowObject() {
  return !!window;
}

export function isTestEnvironment() {
  return process.env.NODE_ENV === 'test';
}
