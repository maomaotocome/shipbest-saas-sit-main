"use client";

import { createOrder } from "@/actions/billing/payment/order";
import { useUtmTracker } from "@/hooks/use-utm-tracker";
import { JsonObject } from "@/types/json";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderPage() {
  const t = useTranslations("user.order");
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getUtmData } = useUtmTracker();

  useEffect(() => {
    const initPayment = async () => {
      const planId = searchParams.get("planId");
      const periodId = searchParams.get("periodId");

      if (!planId || !periodId) {
        setError("Missing required parameters");
        setIsLoading(false);
        return;
      }

      try {
        const result = await createOrder({
          planId,
          periodId,
          utmData: (getUtmData() as unknown as JsonObject) || {},
        });

        if (result.result === "success" && result.data.url) {
          location.href = result.data.url;
        } else {
          setError(t("paymentFailed"));
        }
      } catch (error) {
        setError(t("paymentFailed"));
        console.error("Error creating order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initPayment();
  }, [searchParams, t, getUtmData]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        {isLoading ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="text-center text-gray-600 dark:text-gray-300">{t("initiatingPayment")}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-red-500">{error}</p>
            <Link
              href="/"
              className="bg-primary hover:bg-primary-dark rounded-md px-4 py-2 text-white"
            >
              {t("backToHome")}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-gray-600 dark:text-gray-300">{t("openingPayment")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
