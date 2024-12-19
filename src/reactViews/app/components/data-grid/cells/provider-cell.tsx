import { Icon } from 'components/icon';
import { DatabaseProviderInformation } from 'sync/database-service';
import { displayProvider, displayRegion } from 'utils/database';
import { MultiLineCell } from './multi-line-cell';

type ProviderCellProps = {
  provider?: DatabaseProviderInformation;
};

export function ProviderCell({ provider }: ProviderCellProps) {
  if (!provider) {
    return <MultiLineCell title="-" />;
  }

  const { icon, name } = displayProvider(provider.name);
  const region = displayRegion(provider.name, provider.region);

  return (
    <div className="flex items-center">
      <span className="mr-4">
        <Icon size="xxlarge" name={icon} />
      </span>
      <MultiLineCell title={name} description={region} />
    </div>
  );
}
