import { DataTable } from "@/components/common/data-table";
import { PeriodType, PurchaseStatus } from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";
import { formatDateI18n } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { PurchaseWithDetail } from "../hooks/usePurchases";
import { RefundConfirmDialog } from "./RefundConfirmDialog";

interface PurchaseTableProps {
  purchases: PurchaseWithDetail[];
  onRefund: (purchaseId: string) => void;
  loading?: boolean;
}

const periodTypeMap: Record<PeriodType, { singular: string; plural: string }> = {
  [PeriodType.DAYS]: { singular: "day", plural: "days" },
  [PeriodType.WEEKS]: { singular: "week", plural: "weeks" },
  [PeriodType.MONTHS]: { singular: "month", plural: "months" },
  [PeriodType.YEARS]: { singular: "year", plural: "years" },
  [PeriodType.LIFETIME]: { singular: "lifetime", plural: "lifetime" },
  [PeriodType.ONE_TIME]: { singular: "one time", plural: "one time" },
};

export function PurchaseTable({ purchases, onRefund, loading }: PurchaseTableProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin.billing.purchases");
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseWithDetail | null>(null);

  const handleRefundClick = (purchase: PurchaseWithDetail) => {
    setSelectedPurchase(purchase);
  };

  const handleRefundConfirm = () => {
    if (selectedPurchase) {
      onRefund(selectedPurchase.id);
      setSelectedPurchase(null);
    }
  };

  const columns = [
    {
      header: t("user"),
      accessorKey: "billingUser.user",
      cell: (row: PurchaseWithDetail) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {row.billingUser.user.name || row.billingUser.user.email}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.billingUser.user.email}
          </div>
        </div>
      ),
    },
    {
      header: t("plan"),
      accessorKey: "planPeriod.name",
      cell: (row: PurchaseWithDetail) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {row.planPeriod.plan.translations.find((t) => t.locale === locale)?.nickname}
        </div>
      ),
    },
    {
      header: t("period"),
      accessorKey: "planPeriod.periodValue",
      cell: (row: PurchaseWithDetail) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {row.planPeriod.periodValue ?? "-"}{" "}
          {row.planPeriod.periodValue && row.planPeriod.periodType
            ? row.planPeriod.periodValue > 1
              ? periodTypeMap[row.planPeriod.periodType].plural
              : periodTypeMap[row.planPeriod.periodType].singular
            : null}
        </div>
      ),
    },
    {
      header: t("resetPeriod"),
      accessorKey: "planPeriod.resetPeriodValue",
      cell: (row: PurchaseWithDetail) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {row.planPeriod.resetPeriodValue ?? "-"}{" "}
          {row.planPeriod.resetPeriodValue && row.planPeriod.resetPeriodType
            ? row.planPeriod.resetPeriodValue > 1
              ? periodTypeMap[row.planPeriod.resetPeriodType].plural
              : periodTypeMap[row.planPeriod.resetPeriodType].singular
            : null}
        </div>
      ),
    },
    {
      header: t("date"),
      accessorKey: "purchaseDate",
      cell: (row: PurchaseWithDetail) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {formatDateI18n(new Date(row.purchaseDate), locale)}
        </div>
      ),
    },
    {
      header: t("status"),
      accessorKey: "status",
      cell: (row: PurchaseWithDetail) => (
        <span
          className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
            row.status === PurchaseStatus.REFUNDED
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          }`}
        >
          {t(`statuses.${row.status.toLowerCase()}`)}
        </span>
      ),
    },
  ];

  const customActions = (row: PurchaseWithDetail) => {
    if (row.status === PurchaseStatus.REFUNDED) return null;

    return (
      <button
        onClick={() => handleRefundClick(row)}
        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
      >
        {t("refund")}
      </button>
    );
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={purchases}
        loading={loading}
        customActions={customActions}
      />
      <RefundConfirmDialog
        open={!!selectedPurchase}
        onOpenChange={(open) => !open && setSelectedPurchase(null)}
        onConfirm={handleRefundConfirm}
      />
    </>
  );
}
