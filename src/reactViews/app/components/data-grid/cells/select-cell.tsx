import { Select, SelectOption, SelectValue } from 'components/inputs/select';

type SelectCellProps<T> = {
  options: Array<SelectOption<T extends Array<SelectValue> ? T[number] : T>>;
  error?: string;
  value: T extends Array<SelectValue> ? T : T | null;
  onChange: (value: T extends Array<SelectValue> ? T : T | null) => void;
};

export function SelectCell<T extends SelectValue | Array<SelectValue>>({ options, error, value, onChange }: SelectCellProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select options={options} error={error} value={value} onChange={onChange} suppressMeta chipStatus="info" withPortal />
    </div>
  );
}
