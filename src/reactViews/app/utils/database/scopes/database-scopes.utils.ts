import type { Option } from 'types/options';
import { differenceWith, unionWith } from 'utils/lists';

export type Context = 'primary' | 'secondary';

type MultiStepValue = {
  primary?: Option | null;
  secondary?: Option | null;
};

export const ALL_COLLECTIONS = 'All Collections';

export type ReplicationFormScope = {
  id: string;
  source: ScopeCollectionFilter;
  target: ScopeCollectionFilter;
};

export type FilteredScope = {
  name: string;
  collections: {
    name: string;
  }[];
  inUse?: boolean;
};

export type ScopeCollectionFilter = {
  key: string;
  value: string;
} & Partial<MultiStepValue>;

type PartialFormScope = {
  source?: ScopeCollectionFilter;
  target?: ScopeCollectionFilter;
};
type UsedFormScopes = {
  source: Record<string, FilteredScope>;
  target: Record<string, FilteredScope>;
};

type AvailableScopesProps = {
  sourceScopes: FilteredScope[];
  targetScopes: FilteredScope[];
  formScopes: ReplicationFormScope[];
};

type WithName = {
  name: string;
};
const nameComparator = <T extends WithName>(a: T, b: T): boolean => a.name === b.name;

const isUsedScope = (scope: ScopeCollectionFilter): boolean => {
  return !!scope?.key && !!scope?.value && !!scope?.primary && !!scope?.secondary;
};

const mapUsedScope = (scope: ReplicationFormScope): PartialFormScope => ({
  source: isUsedScope(scope.source) ? scope.source : undefined,
  target: isUsedScope(scope.target) ? scope.target : undefined,
});

const filterToScope = (filter: ScopeCollectionFilter): FilteredScope => ({
  name: filter.primary?.label || filter.key,
  collections: [{ name: filter.secondary?.label || filter.value }],
});

const appendFilter = (record: Record<string, FilteredScope>, filter?: ScopeCollectionFilter): Record<string, FilteredScope> => {
  if (!filter) {
    return record;
  }
  const scope = filterToScope(filter);

  return {
    ...record,
    [scope.name]: {
      name: scope.name,
      collections: unionWith(nameComparator, record[scope.name]?.collections || [], scope.collections),
    },
  };
};

const findUsedScopes = (scope: ReplicationFormScope[]): UsedFormScopes => {
  return scope.map(mapUsedScope).reduce(
    (acc: UsedFormScopes, curr) => {
      return {
        source: appendFilter(acc.source, curr.source),
        target: appendFilter(acc.target, curr.target),
      } as UsedFormScopes;
    },
    {
      source: {},
      target: {},
    }
  );
};

const filterOutScopes = (scopes: FilteredScope[], used: Record<string, FilteredScope>): FilteredScope[] => {
  const filteredScopes = scopes
    .map((scope) => {
      if ((used[scope.name]?.collections || []).find((use) => use.name === ALL_COLLECTIONS)) {
        return null;
      }

      const collections = differenceWith(nameComparator, scope.collections, used[scope.name]?.collections || []);
      if (!collections.length) {
        return null;
      }

      return {
        ...scope,
        collections,
        inUse: used[scope.name]?.collections?.length > 0,
      };
    })
    .filter(Boolean);

  return filteredScopes as FilteredScope[];
};

export const availableScopes = ({
  sourceScopes,
  targetScopes,
  formScopes,
}: AvailableScopesProps): {
  source: FilteredScope[];
  target: FilteredScope[];
} => {
  if (!formScopes || !formScopes.length) {
    return {
      source: sourceScopes || [],
      target: targetScopes || [],
    };
  }
  const usedScopes = findUsedScopes(formScopes);

  const source = filterOutScopes(sourceScopes || [], usedScopes.source);
  const target = filterOutScopes(targetScopes || [], usedScopes.target);

  return {
    source,
    target,
  };
};
