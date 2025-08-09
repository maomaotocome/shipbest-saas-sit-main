import { DataTable } from "@/components/common/data-table";
import Pagination from "@/components/common/pagination";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { CreditGrant, CreditTransaction } from "@/db/generated/prisma";
import { formatDateTimeI18n, translateEnum } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { DateRange } from "react-day-picker";

export interface CreditTransactionWithDetails extends CreditTransaction {
  details: {
    grant: CreditGrant;
    amount: number;
  }[];
}

interface CreditsTransactionsProps {
  transactions?: CreditTransactionWithDetails[];
  loading?: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function CreditsTransactions({
  transactions,
  loading,
  totalPages,
  currentPage,
  onPageChange,
  dateRange,
  onDateRangeChange,
}: CreditsTransactionsProps) {
  const t = useTranslations("user.credits");
  const locale = useLocale();

  const transactionColumns = [
    {
      header: t("date"),
      accessorKey: "createdAt",
      cell: (row: CreditTransactionWithDetails) =>
        formatDateTimeI18n(new Date(row.createdAt), locale),
    },
    {
      header: t("type"),
      accessorKey: "type",
      cell: (row: CreditTransactionWithDetails) =>
        translateEnum(t, "creditTransactionType", row.type),
    },
    {
      header: t("status"),
      accessorKey: "status",
      cell: (row: CreditTransactionWithDetails) =>
        translateEnum(t, "creditTransactionStatus", row.status),
    },
    {
      header: t("amount"),
      accessorKey: "totalAmount",
      cell: (row: CreditTransactionWithDetails) => row.totalAmount,
    },
    {
      header: t("refundAmount"),
      accessorKey: "refundAmount",
      cell: (row: CreditTransactionWithDetails) => row.refundAmount || 0,
    },
    {
      header: t("description"),
      accessorKey: "description",
    },
  ];

  return (
    <>
      <div className="mb-4">
        <DatePickerWithRange value={dateRange} onChange={onDateRangeChange} />
      </div>
      <DataTable columns={transactionColumns} data={transactions || []} loading={loading} />

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
