import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone); // dependent on utc
dayjs.extend(advancedFormat); // dependent on timezone
dayjs.extend(relativeTime);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);

export default dayjs;
