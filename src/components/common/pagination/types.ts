export interface PaginationProps {
  totalPages: number;
  currentPage: number;
  getPageUrl?: (page: number) => string;
  onPageChange?: (page: number) => void;
}

export type PageNumber = number | string;
