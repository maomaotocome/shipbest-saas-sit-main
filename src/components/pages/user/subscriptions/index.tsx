"use client";

import { PlanPeriodFormatText } from "@/components/common/billing/planPeriodText";
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
import { formatDateI18n } from "@/lib/utils";
import { SubscriptionWithDetail } from "@/types/billing/subscriptions";
import { PaginatedResponse } from "@/types/pagination";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { SubscriptionPeriodsModal } from "./SubscriptionPeriodsModal";
import { SubscriptionsTable } from "./SubscriptionsTable";
import { cancelSubscription, fetchSubscriptions } from "./hooks";

export default function SubscriptionsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionWithDetail | null>(
    null
  );
  const [showPeriodsModal, setShowPeriodsModal] = useState(false);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<SubscriptionWithDetail | null>(
    null
  );
  const t = useTranslations("user.subscriptions");
  const locale = useLocale();

  const {
    data: subscriptionData,
    isLoading,
    refetch,
  } = useQuery<PaginatedResponse<SubscriptionWithDetail>>({
    queryKey: ["user-subscriptions", page, pageSize],
    queryFn: () => fetchSubscriptions({ page, pageSize }),
  });

  const subscriptions = subscriptionData?.items || [];
  const totalPages = subscriptionData?.totalPages ?? 0;

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

    // Find current active period, return latest period if none found
    const activePeriod = subscription.periods.find((p) => p.status === "ACTIVE");
    const latestPeriod = subscription.periods[0]; // Already sorted by periodNumber desc

    return activePeriod?.endDate || latestPeriod?.endDate || null;
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    const success = await cancelSubscription(subscriptionId);
    if (success) {
      setSubscriptionToCancel(null);
      refetch();
    }
  };

  const handleCancelClick = (subscription: SubscriptionWithDetail) => {
    setSubscriptionToCancel(subscription);
  };

  const handleViewPeriods = (subscription: SubscriptionWithDetail) => {
    setSelectedSubscription(subscription);
    setShowPeriodsModal(true);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>
      <SubscriptionsTable
        subscriptions={subscriptions}
        loading={isLoading}
        totalPages={totalPages}
        currentPage={page}
        onPageChange={setPage}
        onViewPeriods={handleViewPeriods}
        onCancelSubscription={handleCancelClick}
      />

      <SubscriptionPeriodsModal
        subscription={selectedSubscription}
        open={showPeriodsModal}
        onOpenChange={setShowPeriodsModal}
      />

      <AlertDialog open={!!subscriptionToCancel} onOpenChange={() => setSubscriptionToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmCancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>{t("confirmCancelDescription")}</p>
                {subscriptionToCancel && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-2 font-medium">{t("subscriptionDetails")}</h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-medium">{t("planName")}:</span>{" "}
                        {getPlanName(subscriptionToCancel)}
                      </div>
                      <div>
                        <span className="font-medium">{t("billingCycle")}:</span>{" "}
                        {subscriptionToCancel.planPeriod ? (
                          <PlanPeriodFormatText
                            type={subscriptionToCancel.planPeriod.periodType}
                            value={subscriptionToCancel.planPeriod.periodValue}
                          />
                        ) : (
                          "N/A"
                        )}
                      </div>
                      <div>
                        <span className="font-medium">{t("price")}:</span> $
                        {(subscriptionToCancel.currentPrice / 100).toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">{t("startDate")}:</span>{" "}
                        {formatDateI18n(subscriptionToCancel.startDate, locale)}
                      </div>
                      {subscriptionToCancel.endDate && (
                        <div>
                          <span className="font-medium">{t("endDate")}:</span>{" "}
                          {formatDateI18n(subscriptionToCancel.endDate, locale)}
                        </div>
                      )}
                      {getCurrentPeriodEndDate(subscriptionToCancel) && (
                        <div>
                          <span className="font-medium">{t("currentPeriodEndDate")}:</span>{" "}
                          {formatDateI18n(getCurrentPeriodEndDate(subscriptionToCancel)!, locale)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                subscriptionToCancel && handleCancelSubscription(subscriptionToCancel.id)
              }
            >
              {t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
