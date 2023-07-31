export const DATABASE_ACCESS: { [key: string]: string } = {
  read: 'Read',
  write: 'Write',
  read_write: 'Read/Write',
};

export type DatabaseAccess = keyof typeof DATABASE_ACCESS;
