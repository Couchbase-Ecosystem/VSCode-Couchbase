import { useRef, useState } from 'react';
import { Icon } from 'components/icon';

type QuickFilterProps = {
  placeholder?: string;
  changeQuickFilter: (value: string) => void;
};

export function QuickFilter({ placeholder, changeQuickFilter }: QuickFilterProps) {
  const filterRef = useRef<HTMLInputElement>(null);
  const [showClear, setShowClear] = useState(false);

  const onInputChange = (value: string) => {
    changeQuickFilter(value);
    setShowClear(!!value);
  };

  const clearQuickFilter = () => {
    if (filterRef.current) {
      filterRef.current.value = '';
    }
    onInputChange('');
  };

  return (
    <div className="flex items-center p-3 border border-on-background-decoration">
      <Icon name="filter" size="large" />
      <input
        className="w-full outline-none px-2"
        ref={filterRef}
        onInput={(event: React.ChangeEvent<HTMLInputElement>) => onInputChange(event.target.value)}
        placeholder={placeholder}
      />
      {showClear && (
        <button type="button" onClick={clearQuickFilter}>
          <Icon name="close" size="small" />
        </button>
      )}
    </div>
  );
}
