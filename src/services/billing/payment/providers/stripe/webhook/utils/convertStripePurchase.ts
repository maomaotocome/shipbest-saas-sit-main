import { PaymentProvider, Prisma, PurchaseStatus } from "@/db/generated/prisma";
import { type JsonObject } from "@/types/json";
import type Stripe from "stripe";

const statusMap: Record<string, PurchaseStatus> = {
  complete: "COMPLETED",
  paid: "COMPLETED",
  unpaid: "COMPLETED", // Default to completed, as detecting session completion indicates successful payment
};

const dateFromUnixTimestamp = (timestamp: number | null) => {
  if (!timestamp) {
    return undefined;
  }
  return new Date(timestamp * 1000);
};

export function convertStripePurchase({
  stripeSession,
  billingUserId,
  planPeriodId,
  providerAccountId,
  purchaseId,
  orderId,
  countryCode,
  ipAddress,
  utmData,
  invoiceId,
}: {
  stripeSession: Stripe.Checkout.Session;
  stripeInvoice?: Stripe.Invoice;
  billingUserId: string;
  providerAccountId: string;
  purchaseId?: string;
  orderId?: string;
  planPeriodId: string;
  countryCode?: string;
  ipAddress?: string;
  utmData?: JsonObject;
  invoiceId?: string;
}): Prisma.PurchaseCreateInput {
  return {
    ...(purchaseId && { id: purchaseId }),
    ...(orderId && { orderId }),
    billingUser: {
      connect: {
        id: billingUserId,
      },
    },
    status: statusMap[stripeSession.payment_status || "complete"] || "COMPLETED",
    provider: PaymentProvider.STRIPE,
    providerAccount: {
      connect: {
        id: providerAccountId,
      },
    },
    providerOrderId: stripeSession.id,
    planPeriod: {
      connect: {
        id: planPeriodId,
      },
    },
    invoice: {
      connect: {
        id: invoiceId,
      },
    },
    purchaseDate: dateFromUnixTimestamp(stripeSession.created) || new Date(),
    info: {
      countryCode,
      ipAddress,
      utmData,
      customerEmail: stripeSession.customer_details?.email || null,
      customerName: stripeSession.customer_details?.name || null,
    },
  };
}
