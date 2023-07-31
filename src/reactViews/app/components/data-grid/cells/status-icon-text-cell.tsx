import { Status, StatusIcon } from 'components/status-icon';
import { MultiLineCell } from './multi-line-cell';

type StatusIconTextProps = {
  text: React.ReactNode;
  status: Status;
  tooltipMessage?: string;
  label?: string;
};

export function StatusIconTextCell({ text, status, tooltipMessage, label }: StatusIconTextProps) {
  return (
    <div className="flex items-center gap-2">
      <StatusIcon status={status} tooltipMessage={tooltipMessage} label={label} className="mb-[3px]" />
      <MultiLineCell title={text} description={label} />
    </div>
  );
}
