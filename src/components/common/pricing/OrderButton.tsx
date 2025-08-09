"use client";

import { createOrder } from "@/actions/billing/payment/order";
import { AuthDialog } from "@/components/common/auth/dialog";
import { PeriodType } from "@/db/generated/prisma";
import { useUtmTracker } from "@/hooks/use-utm-tracker";
import { OrderType } from "@/types/billing/order";
import { JsonObject } from "@/types/json";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";

export interface OrderButtonProps {
  periodType: PeriodType;
  planId: string;
  periodId: string;
  isPopular?: boolean;
}

export default function OrderButton({ periodType, planId, periodId }: OrderButtonProps) {
  const t = useTranslations("pricing");
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { data: session } = useSession();
  const { getUtmData } = useUtmTracker();
  const orderType =
    periodType === PeriodType.LIFETIME || periodType === PeriodType.ONE_TIME
      ? OrderType.Purchase
      : OrderType.Subscribe;

  const handleOrder = async () => {
    if (!session) {
      setShowAuth(true);
      return;
    }

    try {
      setIsLoading(true);
      const result = await createOrder({
        planId,
        periodId,
        utmData: (getUtmData() as unknown as JsonObject) || {},
      });

      if (result.result === "success" && result.data.url) {
        location.href = result.data.url;
      } else {
        toast.error(t("orderFailed"));
      }
    } catch (error) {
      toast.error(t("orderFailed"));
      console.error(error as string);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonText = isLoading ? t("processing") : t(orderType);

  return (
    <>
      <div className="flex w-full justify-center">
        <button
          onClick={handleOrder}
          disabled={isLoading}
          className="hover:bg-primary-dark bg-primary relative z-30 mt-8 w-auto rounded-full px-8 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/95 dark:text-gray-900 dark:hover:bg-white/80"
        >
          {buttonText}
        </button>
      </div>
      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
        redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/user/order?planId=${planId}&periodId=${periodId}`}
      />
    </>
  );
}
