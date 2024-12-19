import { ComponentContainer } from 'components/containers/component-container';
import { Select } from 'components/inputs/select/select';
import {
  getMetadataCopy,
  getPageOptions,
  PaginationSize,
  PER_PAGE_OPTIONS,
  shouldDisplayPageControl,
  shouldDisplayPerPageControl,
} from './pagination.utils';

export type PaginationProps = {
  perPage: PaginationSize;
  totalItems: number;
  displayedItems: number;
  page: number;
  changePage: (page: number, perPage: PaginationSize) => void;
};

export function Pagination({ perPage, totalItems, page, changePage, displayedItems }: PaginationProps) {
  const metadataCopy = getMetadataCopy({ totalItems, displayedItems });
  const pageOptions = getPageOptions({ perPage, totalItems });
  const displayPerPageControl = shouldDisplayPerPageControl({ totalItems });
  const displayPageControl = shouldDisplayPageControl({ perPage, totalItems });

  return (
    <ComponentContainer>
      <div className="items-start pb-10 sm:flex">
        <div className="basis-1/2 justify-start md:inline-flex md:items-center">
          <p className="mb-2 px-2 py-1 align-middle text-sm text-on-background-alternate md:px-gutter-sm">{metadataCopy}</p>
          {displayPerPageControl && (
            <div className="mb-2 border-on-background-decoration px-2 md:border-l md:px-gutter-sm flex items-center">
              <p className="inline-block h-full pr-2 align-middle text-sm text-on-background-alternate">Items per page:</p>
              <div>
                <Select
                  options={PER_PAGE_OPTIONS}
                  value={perPage}
                  onChange={(value) => {
                    if (value) {
                      changePage(1, value);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="mb-2 inline-flex basis-1/2 items-center justify-end px-2 md:px-gutter-sm">
          {displayPageControl && (
            <>
              <p className="pr-2 align-middle text-sm text-on-background-alternate">Displaying page: </p>
              <div className="min-w-[6rem]">
                <Select
                  options={pageOptions}
                  value={page}
                  onChange={(value) => {
                    if (value) {
                      changePage(value, perPage);
                    }
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </ComponentContainer>
  );
}
