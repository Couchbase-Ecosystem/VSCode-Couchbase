import dayjs from 'utils/dayjs';
import { MultiLineCell } from './multi-line-cell';

type DateCellProps = {
  date: Parameters<typeof dayjs>[0];
};

export function DateCell({ date }: DateCellProps) {
  if (!date) {
    return <MultiLineCell title="" description="-" />;
  }

  const distanceToNow = dayjs(date).fromNow();
  const formattedDate = dayjs(date).format('MMM DD, YYYY HH:mm:ss z');

  return <MultiLineCell title={distanceToNow} description={formattedDate} />;
}
