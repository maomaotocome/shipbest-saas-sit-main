import { PlanPeriodFormatText } from "@/components/common/billing/planPeriodText";
import { DataTable } from "@/components/common/data-table";
import Pagination from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import { SubscriptionPeriodStatus } from "@/db/generated/prisma";
import { formatDateI18n, translateEnum } from "@/lib/utils";
import { SubscriptionWithDetail } from "@/types/billing/subscriptions";
import { useLocale, useTranslations } from "next-intl";

interface SubscriptionsTableProps {
  subscriptions: SubscriptionWithDetail[];
  loading: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onViewPeriods: (subscription: SubscriptionWithDetail) => void;
  onCancelSubscription: (subscription: SubscriptionWithDetail) => void;
}

export function SubscriptionsTable({
  subscriptions,
  loading,
  totalPages,
  currentPage,
  onPageChange,
  onViewPeriods,
  onCancelSubscription,
}: SubscriptionsTableProps) {
  const t = useTranslations("user.subscriptions");
  const locale = useLocale();

  const getPlanName = (subscription: SubscriptionWithDetail): string => {
    const translations = subscription.planPeriod?.plan?.translations;
    if (!translations || translations.length === 0) {
      return "N/A";
    }
    const specificLocaleTranslation = translations.find((t) => t.locale === locale);
    return specificLocaleTranslation?.nickname ?? translations[0]?.nickname ?? "N/A";
  };

  const getCurrentPeriodEndDate = (subscription: SubscriptionWithDetail): Date | null => {
    if (!subscription.periods || subscription.periods.length === 0) {
      return null;
    }

    const activePeriod = subscription.periods.find(
      (p) => p.status === SubscriptionPeriodStatus.ACTIVE
    );
    const latestPeriod = subscription.periods[0];

    return activePeriod?.endDate || latestPeriod?.endDate || null;
  };

  const columns = [
    {
      header: t("status"),
      accessorKey: "status",
      cell: (row: SubscriptionWithDetail) => translateEnum(t, "subscriptionStatus", row.status),
    },
    {
      header: t("planName"),
      accessorKey: "planName",
      cell: (row: SubscriptionWithDetail) => getPlanName(row),
    },
    {
      header: t("billingCycle"),
      accessorKey: "billingCycle",
      cell: (row: SubscriptionWithDetail) =>
        row.planPeriod ? (
          <PlanPeriodFormatText
            type={row.planPeriod.periodType}
            value={row.planPeriod.periodValue}
          />
        ) : (
          "N/A"
        ),
    },
    {
      header: t("startDate"),
      accessorKey: "startDate",
      cell: (row: SubscriptionWithDetail) => formatDateI18n(row.startDate, locale),
    },
    {
      header: t("currentPeriodEndDate"),
      accessorKey: "currentPeriodEndDate",
      cell: (row: SubscriptionWithDetail) => {
        const endDate = getCurrentPeriodEndDate(row);
        return endDate ? formatDateI18n(endDate, locale) : "-";
      },
    },
    {
      header: t("endDate"),
      accessorKey: "endDate",
      cell: (row: SubscriptionWithDetail) =>
        row.endDate ? formatDateI18n(row.endDate, locale) : "-",
    },
    {
      header: t("price"),
      accessorKey: "currentPrice",
      cell: (row: SubscriptionWithDetail) => `$${(row.currentPrice / 100).toFixed(2)}`,
    },
    {
      header: t("cancelAt"),
      accessorKey: "cancelAt",
      cell: (row: SubscriptionWithDetail) =>
        row.cancelAt ? formatDateI18n(new Date(row.cancelAt), locale) : "-",
    },
  ];

  const customActions = (row: SubscriptionWithDetail) => (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onViewPeriods(row)}>
        {t("viewPeriods")}
      </Button>
      {row.status === "ACTIVE" && !row.cancelAt && (
        <Button variant="destructive" size="sm" onClick={() => onCancelSubscription(row)}>
          {t("cancelAtPeriodEnd")}
        </Button>
      )}
    </div>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={subscriptions}
        loading={loading}
        customActions={customActions}
      />
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
