import type { Database } from 'sync/database-service/database-service.types';

export const getVersion = (db?: Database) => {
  const version = db?.config?.version;
  return typeof version === 'string' ? version : undefined;
};
