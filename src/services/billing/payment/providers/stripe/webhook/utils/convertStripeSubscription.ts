import { BillingScheme, PaymentProvider, Prisma, SubscriptionStatus } from "@/db/generated/prisma";
import { type JsonObject } from "@/types/json";
import type Stripe from "stripe";

const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
  incomplete: "EXPIRED",
  incomplete_expired: "EXPIRED",
  trialing: "ACTIVE",
  active: "ACTIVE",
  past_due: "ACTIVE",
  canceled: "CANCELLED",
  unpaid: "EXPIRED",
  paused: "ACTIVE",
};

const dateFromUnixTimestamp = (timestamp: number | null) => {
  if (!timestamp) {
    return undefined;
  }
  return new Date(timestamp * 1000);
};

export function convertStripeSubscription({
  stripeSubscription,
  billingUserId,
  planPeriodId,
  providerAccountId,
  subscriptionId,
  orderId,
  countryCode,
  ipAddress,
  utmData,
}: {
  stripeSubscription: Stripe.Subscription;
  billingUserId: string;
  providerAccountId: string;
  subscriptionId?: string;
  orderId?: string;
  planPeriodId?: string;
  countryCode?: string;
  ipAddress?: string;
  utmData?: JsonObject;
}): Prisma.SubscriptionUncheckedCreateInput {
  const currentPrice = stripeSubscription.items.data[0]?.price.unit_amount || 0;
  const currency = stripeSubscription.items.data[0]?.price.currency || "usd";
  return {
    ...(subscriptionId && { id: subscriptionId }),
    ...(orderId && { orderId }),
    billingUserId,
    ...(planPeriodId && { planPeriodId }),
    providerAccountId,
    status: statusMap[stripeSubscription.status],
    provider: PaymentProvider.STRIPE,
    currentPrice: currentPrice,
    currency,
    billingScheme: BillingScheme.HYBRID,
    providerSubscriptionId: stripeSubscription.id,
    startDate: dateFromUnixTimestamp(stripeSubscription.start_date)!,
    endDate: dateFromUnixTimestamp(stripeSubscription.ended_at),
    cancelAt: dateFromUnixTimestamp(stripeSubscription.cancel_at),
    info: {
      countryCode,
      ipAddress,
      utmData,
    },
  };
}
