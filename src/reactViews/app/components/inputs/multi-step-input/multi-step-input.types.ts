import { FieldValue, Option } from 'types/options';

export type Context = 'primary' | 'secondary';

export type MultiStepValue = {
  primary?: Option | null;
  secondary?: Option | null;
};

export type { FieldValue };
