import { PageNumber } from "./types";

export const getPageNumbers = (currentPage: number, totalPages: number): PageNumber[] => {
  const pages: PageNumber[] = [];

  if (totalPages > 1) {
    pages.push(1);
  }

  if (currentPage > 4) {
    pages.push("...");
  }

  for (let i = Math.max(2, currentPage - 2); i <= Math.min(currentPage + 2, totalPages - 1); i++) {
    if (i === 1 || i === totalPages) continue;
    pages.push(i);
  }

  if (currentPage < totalPages - 3) {
    pages.push("...");
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
};
