import { listFormat } from 'utils/lists';
import { validateEmail } from './email';

type ValidateStringConfig = {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  isEmail: boolean;
  caseInsensitivityMatch?: string;
  validate?: (v: string) => string;
  existingList?: string[];
  allowedChars?: AllowedChars[];
  canNotStartWith?: string[];
};

const allowedCharsToRegex = {
  letters: /[a-zA-Z]/gi,
  numbers: /[0-9]/gi,
  dashes: /-/gi,
  underscores: /_/gi,
  percent: /%/gi,
  spaces: / /gi,
  periods: /\./gi,
} as const;

export type AllowedChars = keyof typeof allowedCharsToRegex;

type Validator<T> = (value: T) => string[];

export const validateString =
  ({
    required,
    minLength,
    maxLength,
    isEmail,
    caseInsensitivityMatch,
    validate,
    existingList,
    allowedChars,
    canNotStartWith,
  }: ValidateStringConfig): Validator<string> =>
  (value: string): string[] => {
    const errors = [];

    if (required && !value) {
      errors.push(' is required.');
    }

    if (minLength && value.length < minLength) {
      errors.push(` must be at least ${minLength} characters.`);
    }

    if (maxLength && value.length > maxLength) {
      errors.push(` cannot be more than ${maxLength} characters.`);
    }

    if (isEmail && !validateEmail(value)) {
      errors.push(' must be a valid email address.');
    }

    if (caseInsensitivityMatch && caseInsensitivityMatch.toLowerCase() !== value.toLowerCase()) {
      errors.push(". Values don't match.");
    }

    if (existingList && existingList.includes(value)) {
      errors.push(' already exists.');
    }

    if (value && canNotStartWith && canNotStartWith.length) {
      const result = canNotStartWith.find((startChar) => value.startsWith(startChar));
      if (result) {
        errors.push(` can't start with '${result}'.`);
      }
    }

    if (value && allowedChars && allowedChars.length) {
      const result = allowedChars.reduce((acc, chars) => acc.replace(allowedCharsToRegex[chars], ''), value);
      if (result.length) {
        errors.push(` contains an invalid character '${result[0]}'. It can only contain ${listFormat(allowedChars, 'and')}.`);
      }
    }

    if (validate) {
      const nextErr = validate(value);
      if (nextErr) {
        errors.push(nextErr);
      }
    }

    return errors;
  };

type ValidateNumberConfig = Partial<{
  required: boolean;
  min: number | null;
  max: number | null;
  validate: (v: number) => string;
}>;

export const validateNumber =
  ({ required, min, max, validate }: ValidateNumberConfig) =>
  (value: number): string[] => {
    const errors = [];

    if (required && Number.isNaN(value)) {
      errors.push(' is required.');
    }

    if (typeof min === 'number' && value < min) {
      errors.push(` must be greater than or equal to ${min}.`);
    }

    if (typeof max === 'number' && value > max) {
      errors.push(` must be less than or equal to ${max}.`);
    }

    if (validate) {
      const nextErr = validate(value);
      if (nextErr) {
        errors.push(nextErr);
      }
    }

    return errors;
  };
