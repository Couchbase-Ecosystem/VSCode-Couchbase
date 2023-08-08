import type { Database } from 'sync/database-service/database-service.types';
import { getVersion } from './get-version';
import { hasMinVersion } from './has-min-version';

export const isDbVersionAtLeast712 = (db?: Database) => hasMinVersion('7.1.2')(getVersion(db));
