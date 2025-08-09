import { getInvoice } from "@/db/billing/invoices/getInvoice";
import { getProviderAccount } from "@/db/billing/payment/providers/getProviderAccount";
import { getPurchase } from "@/db/billing/purchases/getPurshase";
import { getSubscription } from "@/db/billing/subscriptions/getSubscription";
import { getPeriod } from "@/db/billing/subscriptions/periods/getPeriod";
import { getOrCreateBillingUserByUserId } from "@/db/billing/users";
import { PaymentProvider, PaymentProviderAccount, Subscription } from "@/db/generated/prisma";
import { refund as stripeRefund } from "../providers/stripe/api/refund";

export const refund = async ({
  userId,
  subscriptionInfo,
  purchaseInfo,
  amount,
}: {
  userId: string;
  subscriptionInfo?: { id: string; periodId: string } | null;
  purchaseInfo?: { id: string } | null;
  amount?: number;
}) => {
  const billingUser = await getOrCreateBillingUserByUserId({ userId });
  let invoiceId: string | undefined | null;
  let providerAccountId: string | undefined | null = null;
  if (subscriptionInfo) {
    const subscription = await getSubscription({
      where: { id: subscriptionInfo.id, billingUserId: billingUser.id },
    });
    invoiceId = await getSubscriptionInvoiceId({
      subscription,
      periodId: subscriptionInfo.periodId,
    });
    providerAccountId = subscription?.providerAccountId;
  } else if (purchaseInfo) {
    invoiceId = await getPurchaseInvoiceId({ purchaseId: purchaseInfo.id });
    const purchase = await getPurchase({
      where: { id: purchaseInfo.id, billingUserId: billingUser.id },
    });
    providerAccountId = purchase?.providerAccountId;
  } else {
    throw new Error("No subscription or purchase ID provided");
  }
  if (!providerAccountId) {
    throw new Error("No provider account ID found");
  }
  const providerAccount = await getProviderAccount({ where: { id: providerAccountId } });
  if (!providerAccount) {
    throw new Error("Provider account not found");
  }
  return refundInvoice({ providerAccount, invoiceId, amount });
};

const getSubscriptionInvoiceId = async ({
  subscription,
  periodId,
}: {
  subscription: Subscription | null;
  periodId: string;
}) => {
  if (!subscription) {
    throw new Error("Subscription not found");
  }
  const period = await getPeriod({ id: periodId, subscriptionId: subscription.id });
  const invoiceId = period?.invoiceId;
  return invoiceId;
};

const getPurchaseInvoiceId = async ({ purchaseId }: { purchaseId: string }) => {
  const purchase = await getPurchase({ where: { id: purchaseId } });
  const invoiceId = purchase?.invoiceId;

  if (!invoiceId) {
    throw new Error("No invoice ID found for purchase");
  }

  return invoiceId;
};

const refundInvoice = async ({
  providerAccount,
  invoiceId,
  amount,
}: {
  providerAccount: PaymentProviderAccount;
  invoiceId?: string | null | undefined;
  amount?: number;
}) => {
  if (!invoiceId) {
    throw new Error("No invoice ID found for purchase");
  }

  const invoice = await getInvoice({ id: invoiceId });

  if (!invoice) {
    throw new Error("Invoice not found");
  }
  handleProviderRefund({
    providerAccount,
    providerInvoiceId: invoice.providerInvoiceId,
    amount,
  });
};

const handleProviderRefund = async ({
  providerAccount,
  providerInvoiceId,
  amount,
}: {
  providerAccount: PaymentProviderAccount;
  providerInvoiceId?: string | null | undefined;
  amount?: number;
}) => {
  if (!providerInvoiceId) {
    throw new Error("No provider invoice ID found");
  }
  switch (providerAccount.provider) {
    case PaymentProvider.STRIPE:
      return stripeRefund({ providerAccount, providerInvoiceId, amount });
    default:
      throw new Error("Provider not supported");
  }
};
