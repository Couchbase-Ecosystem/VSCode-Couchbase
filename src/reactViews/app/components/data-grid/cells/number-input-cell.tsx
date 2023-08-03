import { NumberField, NumberFieldProps } from 'components/inputs/number-field';

export function NumberInputCell(props: NumberFieldProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <NumberField {...props} suppressMeta />
    </div>
  );
}
