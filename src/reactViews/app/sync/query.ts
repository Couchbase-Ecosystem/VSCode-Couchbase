export type QueryOptions = {
  page: number;
  perPage: (typeof PAGINATION_PER_PAGE)[number];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  date?: string;
};

export const DEFAULT_PER_PAGE = 25;

export const PAGINATION_PER_PAGE = [1, 10, 25, 50, 250, 100, 1000] as const;

export type PerPageValue = (typeof PAGINATION_PER_PAGE)[number];

export const defaultPaginationQuery = {
  page: 1,
  perPage: DEFAULT_PER_PAGE,
} as const;

export function optionsQuery(params: QueryOptions): string {
  return new URLSearchParams({ ...params, page: params.page.toString(), perPage: params.perPage.toString() }).toString();
}

export function defaultQuery() {
  return optionsQuery(defaultPaginationQuery);
}
