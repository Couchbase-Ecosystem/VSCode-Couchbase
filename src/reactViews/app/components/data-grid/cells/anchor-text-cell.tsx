import { AnchorProps } from 'components/anchor';
import { AnchorCell } from './anchor-cell';
import { MultiLineCell } from './multi-line-cell';

type AnchorTextCellProps = {
  anchorProps: AnchorProps;
  description?: React.ReactNode;
};

export function AnchorTextCell({ anchorProps, description }: AnchorTextCellProps) {
  return <MultiLineCell title={<AnchorCell {...anchorProps} />} description={description} />;
}
