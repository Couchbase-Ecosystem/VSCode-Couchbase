import { MultiStepValue } from './multi-step-input.types';

export function isMultiStepValue(value: unknown): value is MultiStepValue {
  return value !== undefined && value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function toString(value: MultiStepValue) {
  return `${value?.primary?.label || ''} : ${value?.secondary?.label || ''}`;
}

export function last(list?: MultiStepValue | MultiStepValue[] | null): MultiStepValue | undefined {
  if (!Array.isArray(list)) {
    return list ?? undefined;
  }
  return list?.length ? list[list.length - 1] : undefined;
}

export function isComplete(value?: MultiStepValue | null): boolean {
  return !!(value?.primary?.value && value?.secondary?.value);
}

export function hasValue(value: MultiStepValue | MultiStepValue[] | null): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return !!(value?.primary || value?.secondary);
}

export function asList(value: MultiStepValue | MultiStepValue[] | null): MultiStepValue[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return hasValue(value) ? [value] : [];
}

export function isListValue(value: MultiStepValue | MultiStepValue[] | null, multiple: boolean): value is MultiStepValue[] {
  return Array.isArray(value) || (value === null && multiple);
}
