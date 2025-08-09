import { useTranslations } from "next-intl";
import { PaginationButton } from "./PaginationButton";
import { PaginationProps } from "./types";
import { getPageNumbers } from "./utils";

export default function Pagination({
  totalPages,
  currentPage,
  getPageUrl,
  onPageChange,
}: PaginationProps) {
  const t = useTranslations("components.pagination");

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="mt-8 flex justify-center space-x-2 select-none">
      {currentPage !== 1 && (
        <PaginationButton
          page={Math.max(1, currentPage - 1)}
          label={t("previous")}
          isDisabled={currentPage === 1}
          getPageUrl={getPageUrl}
          onPageChange={onPageChange}
        />
      )}

      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-600 dark:text-gray-400">
              ...
            </span>
          );
        }

        const pageNum = page as number;
        return (
          <PaginationButton
            key={pageNum}
            page={pageNum}
            isActive={currentPage === pageNum}
            getPageUrl={getPageUrl}
            onPageChange={onPageChange}
          />
        );
      })}

      {currentPage !== totalPages && (
        <PaginationButton
          page={Math.min(totalPages, currentPage + 1)}
          label={t("next")}
          isDisabled={currentPage === totalPages}
          getPageUrl={getPageUrl}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
