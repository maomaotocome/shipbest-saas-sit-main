"use client";

import { PlanPeriodFormatText } from "@/components/common/billing/planPeriodText";
import { DataTable } from "@/components/common/data-table";
import Pagination from "@/components/common/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Prisma } from "@/db/generated/prisma";
import { formatDateI18n } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useCancelSubscription, useRefundPeriod, useSubscriptions } from "./hooks";
import PeriodDetailsDialog from "./PeriodDetailsDialog";

type SubscriptionListItem = Prisma.SubscriptionGetPayload<{
  include: {
    periods: true;
    billingUser: {
      include: {
        user: true;
      };
    };
    planPeriod: {
      include: {
        plan: {
          include: {
            translations: true;
          };
        };
      };
    };
  };
}>;

export default function SubscriptionsPage() {
  const t = useTranslations("admin.billing.subscriptions");
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const { data: subscriptionData, isLoading } = useSubscriptions({ page, pageSize });
  const cancelSubscription = useCancelSubscription();
  const refundPeriod = useRefundPeriod();

  const subscriptions = subscriptionData?.items || [];
  const totalPages = subscriptionData?.totalPages ?? 0;

  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>();
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<SubscriptionListItem | null>(
    null
  );

  const columns = [
    {
      header: t("columns.billingUser"),
      accessorKey: "billingUser.user.email",
      cell: (row: SubscriptionListItem) => row.billingUser.user.email,
    },
    {
      header: t("columns.planName"),
      accessorKey: "planPeriod.plan.translations[0].nickname",
      cell: (row: SubscriptionListItem) => {
        const translation = row.planPeriod?.plan?.translations?.[0];
        return translation?.nickname || "-";
      },
    },
    {
      header: t("columns.billingPeriod"),
      accessorKey: "planPeriod.periodType",
      cell: (row: SubscriptionListItem) => {
        if (!row.planPeriod) return "-";
        return (
          <PlanPeriodFormatText
            type={row.planPeriod.periodType}
            value={row.planPeriod.periodValue}
          />
        );
      },
    },
    {
      header: t("columns.resetPeriod"),
      accessorKey: "planPeriod.resetPeriodType",
      cell: (row: SubscriptionListItem) => {
        if (!row.planPeriod?.resetPeriodType) return "-";
        return (
          <PlanPeriodFormatText
            type={row.planPeriod.resetPeriodType}
            value={row.planPeriod.resetPeriodValue}
          />
        );
      },
    },
    {
      header: t("columns.status"),
      accessorKey: "status",
      cell: (row: SubscriptionListItem) => t(`statusEmuns.${row.status}`),
    },
    {
      header: t("columns.currentPrice"),
      accessorKey: "currentPrice",
    },
    {
      header: t("columns.startDate"),
      accessorKey: "startDate",
      cell: (row: SubscriptionListItem) => formatDateI18n(new Date(row.startDate), locale),
    },
    {
      header: t("columns.endDate"),
      accessorKey: "endDate",
      cell: (row: SubscriptionListItem) =>
        row.endDate ? formatDateI18n(new Date(row.endDate), locale) : "",
    },
  ];

  const handleCancel = async (id: string) => {
    try {
      await cancelSubscription.mutateAsync({ subscriptionId: id });
      setSubscriptionToCancel(null);
    } catch (error) {
      console.error("Error canceling subscription:", error);
    }
  };

  const handleRefund = async () => {
    if (!selectedSubscriptionId || !selectedPeriodId) return;

    try {
      await refundPeriod.mutateAsync({
        subscriptionId: selectedSubscriptionId,
        periodId: selectedPeriodId,
      });
      setSelectedPeriodId(undefined);
      setSelectedSubscriptionId(undefined);
    } catch (error) {
      console.error("Error refunding period:", error);
    }
  };

  return (
    <div className="mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      <DataTable
        columns={columns}
        data={subscriptions}
        loading={isLoading}
        customActions={(row: SubscriptionListItem) =>
          !row.cancelAtPeriodEnd &&
          row.status === "ACTIVE" && (
            <Button variant="destructive" onClick={() => setSubscriptionToCancel(row)}>
              {t("cancelSubscription")}
            </Button>
          )
        }
      />

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
        </div>
      )}

      {selectedSubscriptionId && selectedPeriodId && (
        <PeriodDetailsDialog
          isOpen={true}
          onClose={() => {
            setSelectedPeriodId(undefined);
            setSelectedSubscriptionId(undefined);
          }}
          subscriptionId={selectedSubscriptionId}
          periodId={selectedPeriodId}
          onRefund={handleRefund}
        />
      )}

      <AlertDialog open={!!subscriptionToCancel} onOpenChange={() => setSubscriptionToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmCancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmCancelDescription", {
                email: subscriptionToCancel?.billingUser.user.email ?? "",
                plan: subscriptionToCancel?.planPeriod?.plan.translations[0]?.nickname ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => subscriptionToCancel && handleCancel(subscriptionToCancel.id)}
            >
              {t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
