import { last } from './last';

export function listFormat(list: string[], conjunction: string) {
  /** copy list in order not to modify actual one */
  if (!list.length) return '';

  if (list.length > 1) {
    const items = list.slice(0, -1);
    const lastItem = last(list)!;

    return `${items.join(', ')} ${conjunction} ${lastItem}`;
  }

  return list[0];
}
