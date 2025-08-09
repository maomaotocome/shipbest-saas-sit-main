"use client";
import { queryOrderStatus } from "@/actions/user/order-status/query";
import CheckmarkAnimate from "@/components/common/animate/checkmark-animate";
import LoadingAnimate from "@/components/common/animate/loading-animate";
import { PlanPeriodFormatText } from "@/components/common/billing/planPeriodText";
import { PeriodType } from "@/db/generated/prisma";
import { OrderType } from "@/types/billing/order";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
interface OrderStatus {
  status: string;
  isSuccess: boolean;
  planName?: string;
  periodType?: PeriodType;
  periodValue?: number | null;
  resetPeriodType?: PeriodType | null;
  resetPeriodValue?: number | null;
  error?: string;
}

export default function ThanksPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const orderType = searchParams.get("orderType") as OrderType;
  const t = useTranslations("user.thanks");
  const router = useRouter();

  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !orderType) {
      router.push("/");
      return;
    }

    const checkOrderStatus = async () => {
      try {
        const data = await queryOrderStatus(orderId, orderType);

        if (data.status === "not_found") {
          setOrderStatus({
            status: "not_found",
            isSuccess: false,
            planName: undefined,
            periodType: undefined,
            periodValue: undefined,
            resetPeriodType: undefined,
            resetPeriodValue: undefined,
          });
          setIsLoading(false);
          return;
        }

        // Ensure data has required properties
        const orderStatus: OrderStatus = {
          status: data.status,
          isSuccess: data.isSuccess ?? false,
          planName: data.planName,
          periodType: data.periodType,
          periodValue: data.periodValue,
          resetPeriodType: data.resetPeriodType,
          resetPeriodValue: data.resetPeriodValue,
        };

        setOrderStatus(orderStatus);
        setIsLoading(false);

        // If order is not successful, continue polling
        if (!orderStatus.isSuccess) {
          setTimeout(checkOrderStatus, 5000);
        }
      } catch (error) {
        console.error("Error checking order status:", error);
        setIsLoading(false);
      }
    };

    checkOrderStatus();
  }, [orderId, orderType, router]);

  // Condition for showing loading animation: initial loading or order not successful
  const showLoading = isLoading || !orderStatus?.isSuccess;

  if (showLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="mb-8 h-32 w-32">
          <LoadingAnimate />
        </div>
        <h1 className="mb-4 text-2xl font-bold">{t("title")}</h1>
        <p>{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {orderStatus?.isSuccess && (
        <div className="mb-8 h-32 w-32">
          <CheckmarkAnimate />
        </div>
      )}
      <h1 className="mb-4 text-2xl font-bold">
        {orderStatus?.isSuccess
          ? orderType === OrderType.Purchase
            ? t("success.purchaseTitle")
            : t("success.subscriptionTitle")
          : t("error.title")}
      </h1>
      <p className="mb-4">
        {orderStatus?.isSuccess
          ? orderType === OrderType.Purchase
            ? t("success.purchaseMessage", { planName: orderStatus.planName ?? "" })
            : t("success.subscriptionMessage", { planName: orderStatus.planName ?? "" })
          : t("error.message")}
      </p>
      {orderStatus?.isSuccess && orderStatus.periodType && (
        <div className="mb-4 text-center">
          <p className="text-gray-600">
            {t("period")}:{" "}
            <PlanPeriodFormatText
              type={orderStatus.periodType}
              value={orderStatus.periodValue ?? null}
            />
          </p>
          {orderStatus.resetPeriodType && (
            <p className="text-gray-600">
              {t("resetPeriod")}:{" "}
              <PlanPeriodFormatText
                type={orderStatus.resetPeriodType}
                value={orderStatus.resetPeriodValue ?? null}
              />
            </p>
          )}
        </div>
      )}
      <button
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        onClick={() => {
          if (orderStatus?.isSuccess) {
            router.push("/user/invoices");
          } else {
            router.push("/");
          }
        }}
      >
        {orderStatus?.isSuccess ? t("success.button") : t("error.button")}
      </button>
    </div>
  );
}
