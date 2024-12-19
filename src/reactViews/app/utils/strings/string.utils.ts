import { FieldValue } from 'components/inputs/multi-step-input/multi-step-input.types';
import { fixedDecimal, isNumber, toNumber } from 'utils/number';

export const capitalize = (word: string) => {
  if (!word || word.length < 1) return '';
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
};

export function copyToClipboard(text: string) {
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(text);
  }
}

export function matchLeftCharacters(term: string, matches: string[]): boolean {
  const termLCase = term.toLowerCase();
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    if (match.toLowerCase().startsWith(termLCase)) {
      return true;
    }
  }
  return false;
}

export const matchValueType = (valueToMatch: FieldValue | null, value?: string): FieldValue | null => {
  if (value === undefined) {
    return null;
  }
  if (valueToMatch === null) {
    // cast as boolean
    if (value === 'true' || value === 'false') {
      return value === 'true';
    }
    if (isNumber(value)) {
      return toNumber(value);
    }
    return value;
  }
  if (typeof valueToMatch === 'number') {
    return toNumber(value);
  }
  if (typeof valueToMatch === 'boolean') {
    return value === 'true';
  }
  return value;
};

export const pluralize = (number: number, singular: string, plural: string) => (number === 1 ? singular : plural);

// Returns full descriptor string for count of entity.
// For use in Entity Count headers found in app.
// IE:  (1, "Cluster", "Clusters") => "1 Cluster"
// IE:  (2, "Cluster", "Clusters") => "2 Clusters"
// IE:  (0, "Cluster", "Clusters") => "0 Clusters"
export const pluralizeCount = (number: number, singular: string, plural: string, skipZero = false) => {
  if (skipZero && number === 0) {
    return '';
  }
  const descriptor = pluralize(number, singular, plural);
  return `${number} ${descriptor}`;
};

const titleizeWithSeparator = (separator: RegExp) => (word: string) =>
  (typeof word === 'string' ? word : '')
    .split(separator)
    .map((v: string) => capitalize(v.toLowerCase()))
    .join(' ');

export const titleize = titleizeWithSeparator(/ /);

export const titleizeSnakeCase = titleizeWithSeparator(/_/);

export const titleizeCamelCase = titleizeWithSeparator(/(?=[A-Z])/);

export const titleizeApiMessage = titleizeWithSeparator(/[ _]/);

export const toPercentage = (value?: number | null): string => {
  return value && typeof value === 'number' ? `${fixedDecimal(value, 2)}%` : '0%';
};

/**
 * Truncate a string to a given length, and optionally add ellipsis at the end
 * if truncated
 */

export function truncate(value: string, maxLength: number, addEllipsis: boolean) {
  if (!value || value.length < maxLength) {
    return value;
  }
  return value.slice(0, maxLength) + (addEllipsis ? '...' : '');
}

export const maskString = (input: string, character = '*') => new Array(input.length).fill(character).join('');
