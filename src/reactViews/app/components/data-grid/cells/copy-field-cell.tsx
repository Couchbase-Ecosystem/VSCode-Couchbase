import { CopyField, CopyFieldProps } from 'components/copy-field';

type CopyFieldCellProps = Omit<CopyFieldProps, 'slim' | 'label' | 'icon'>;

export function CopyFieldCell(props: CopyFieldCellProps) {
  return <CopyField {...props} slim />;
}
