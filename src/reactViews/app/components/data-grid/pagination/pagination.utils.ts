import { pluralize } from 'utils/strings';

const formatNumber = new Intl.NumberFormat().format;

const PER_PAGE = [10, 25, 50, 100, 250] as const;

export type PaginationSize = (typeof PER_PAGE)[number];

export const PER_PAGE_OPTIONS = PER_PAGE.map((item) => ({
  label: `${item}`,
  value: item,
}));

const MIN_PER_PAGE = PER_PAGE_OPTIONS[0].value;

export const getMetadataCopy = ({ displayedItems, totalItems }: { displayedItems: number; totalItems: number }) => {
  const isPaginationFitOnOnePage = displayedItems <= totalItems;

  return isPaginationFitOnOnePage
    ? `Showing ${displayedItems} of ${formatNumber(totalItems)} results`
    : `Showing ${formatNumber(totalItems)} ${pluralize(totalItems, 'result', 'results')}`;
};

export const shouldDisplayPerPageControl = ({ totalItems }: { totalItems: number }) => totalItems > MIN_PER_PAGE;

export const shouldDisplayPageControl = ({ perPage, totalItems }: { perPage: number; totalItems: number }) => totalItems > perPage;

export const getPageOptions = ({ perPage, totalItems }: { perPage: number; totalItems: number }) => {
  const pages = Math.ceil(totalItems / perPage);
  const maxPage = pages;

  return [...Array(pages).keys()].map((index) => {
    const page = index + 1;

    return { label: `${page} of ${maxPage}`, value: page };
  });
};
