import { Toggle, ToggleValue } from 'components/toggle';
import { Option } from 'types/options';

type ToggleCellProps<T> = {
  value: T;
  options: Option[];
  onChange?: (value: T) => void;
};

export function ToggleCell({ value, options, onChange }: ToggleCellProps<ToggleValue>) {
  return (
    <div className="flex flex-wrap gap-2">
      <Toggle value={value} options={options} onChange={onChange} altText="" />
    </div>
  );
}
