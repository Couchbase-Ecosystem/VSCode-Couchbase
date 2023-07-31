import { Icon } from 'components/icon';
import { SSOProvider } from 'constants/provider';
import { RealmIDPStandard } from 'sync/realm-service';
import { displaySSOProvider } from 'utils/sso';
import { MultiLineCell } from './multi-line-cell';

type SSOProviderCellProps = {
  name?: SSOProvider;
  standard?: RealmIDPStandard;
};

export function SSOProviderCell({ name, standard }: SSOProviderCellProps) {
  const provider = name && displaySSOProvider(name);

  if (provider && standard) {
    return (
      <div className="flex items-center">
        <span className="mr-4">
          <Icon size="xxlarge" name={provider.icon} />
        </span>
        <MultiLineCell title={name} description={standard} />
      </div>
    );
  }
  return <MultiLineCell title="-" />;
}
