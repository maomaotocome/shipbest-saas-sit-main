import Link from "next/link";
import { useCallback } from "react";

interface PaginationButtonProps {
  page: number;
  isActive?: boolean;
  isDisabled?: boolean;
  label?: string;
  getPageUrl?: (page: number) => string;
  onPageChange?: (page: number) => void;
}

export function PaginationButton({
  page,
  isActive = false,
  isDisabled = false,
  label,
  getPageUrl,
  onPageChange,
}: PaginationButtonProps) {
  const commonClasses = `rounded px-4 py-2 transition-colors ${
    isDisabled
      ? "cursor-not-allowed bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
      : isActive
        ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
        : "text-[var(--color-primary)] hover:text-[var(--color-primary)] bg-[var(--color-card)] dark:hover:bg-[var(--color-muted)]"
  }`;

  const handleClick = useCallback(() => {
    if (!isDisabled && onPageChange) {
      onPageChange(page);
    }
  }, [page, isDisabled, onPageChange]);

  if (onPageChange) {
    return (
      <button onClick={handleClick} disabled={isDisabled} className={commonClasses} type="button">
        {label || page}
      </button>
    );
  }

  return (
    <Link href={getPageUrl!(page)} className={commonClasses}>
      {label || page}
    </Link>
  );
}
