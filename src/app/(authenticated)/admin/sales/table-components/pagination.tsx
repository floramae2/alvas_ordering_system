'use client'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination";
  import { type PaginationType } from "@/lib/types/pagination";
  
  export function DataPagination({
    filter,
    count,
    setFilter,
  }: {
    filter: PaginationType;
    count: number;
    setFilter: (updater: (prev: PaginationType) => PaginationType) => void;
  }) {
    const page = filter.skip / filter.take + 1;
    const totalPage = Math.ceil(count / filter.take);
  
    const onNext = () => {
      if (page < totalPage) {
        setFilter((prev) => ({
          ...prev,
          skip: prev.skip + prev.take,
        }));
      }
    };
    const onPrev = () => {
      if (page > 1) {
        setFilter((prev) => ({
          ...prev,
          skip: prev.skip - prev.take,
        }));
      }
    };
  
    return (
      <Pagination>
        <PaginationContent className="flex flex-row w-full p-2 place-content-end">
          <PaginationItem>
            <PaginationPrevious
              onClick={onPrev}
              className={`text-xs sm:text-sm  ${
                page > 1
                  ? " cursor-pointer"
                  : " hover:bg-white text-gray-400 hover:text-gray-400"
              }`}
            />
          </PaginationItem>
          <PaginationItem>
            <div className="text-xs text-gray-700 sm:text-sm">
              {page} of {totalPage}
            </div>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={onNext}
              className={`text-xs sm:text-sm ${
                page < totalPage
                  ? " cursor-pointer"
                  : " hover:bg-white text-gray-400 hover:text-gray-400"
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  }
  