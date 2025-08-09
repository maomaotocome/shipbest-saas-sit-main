"use server";

import { PurchaseStatus, SubscriptionStatus } from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";
import { prisma } from "@/lib/prisma";
import { OrderType } from "@/types/billing/order";
import { getLocale } from "next-intl/server";

export async function queryOrderStatus(orderId: string, orderType: OrderType) {
  const locale = (await getLocale()) as Locale;
  if (!orderId || !orderType) {
    throw new Error("Missing orderId or orderType");
  }

  try {
    if (orderType === OrderType.Purchase) {
      const purchase = await prisma.purchase.findUnique({
        where: { orderId },
        include: {
          planPeriod: {
            include: {
              plan: {
                include: {
                  translations: {
                    where: { locale: locale },
                  },
                },
              },
            },
          },
        },
      });
      if (!purchase) {
        return { status: "not_found" };
      }

      return {
        status: purchase.status,
        isSuccess: purchase.status === PurchaseStatus.COMPLETED,
        planName: purchase.planPeriod?.plan.translations[0]?.nickname,
        periodType: purchase.planPeriod?.periodType,
        periodValue: purchase.planPeriod?.periodValue,
        resetPeriodType: purchase.planPeriod?.resetPeriodType,
        resetPeriodValue: purchase.planPeriod?.resetPeriodValue,
      };
    } else if (orderType === OrderType.Subscribe) {
      const subscription = await prisma.subscription.findUnique({
        where: { orderId },
        include: {
          planPeriod: {
            include: {
              plan: {
                include: {
                  translations: {
                    where: { locale: locale },
                  },
                },
              },
            },
          },
        },
      });
      if (!subscription) {
        return { status: "not_found" };
      }

      return {
        status: subscription.status,
        isSuccess: subscription.status === SubscriptionStatus.ACTIVE,
        planName: subscription.planPeriod?.plan.translations[0]?.nickname,
        periodType: subscription.planPeriod?.periodType,
        periodValue: subscription.planPeriod?.periodValue,
        resetPeriodType: subscription.planPeriod?.resetPeriodType,
        resetPeriodValue: subscription.planPeriod?.resetPeriodValue,
      };
    }

    throw new Error("Invalid order type");
  } catch (error) {
    console.error("Error checking order status:", error);
    throw new Error("Internal server error");
  }
}
