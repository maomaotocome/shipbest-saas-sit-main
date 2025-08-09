import { PaymentProvider, PaymentProviderAccount } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
import { cancel as stripeCancel } from "../providers/stripe/api";

export const cancel = async ({
  userId,
  subscriptionId,
}: {
  userId: string;
  subscriptionId: string;
}) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      billingUser: true,
    },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }
  if (subscription.billingUser.userId !== userId) {
    throw new Error("User does not have access to this subscription");
  }
  const providerAccountId = subscription.providerAccountId;
  const providerAccount = await getProviderAccount(providerAccountId);
  const userPaymentProviderCustomer = await getUserPaymentProviderCustomer(
    subscription.billingUser.id,
    providerAccount.id
  );

  if (!userPaymentProviderCustomer) {
    throw new Error("User payment provider customer not found");
  }

  return handlePaymentProvider({
    providerAccount,
    providerSubscriptionId: subscription.providerSubscriptionId,
  });
};

const getUserPaymentProviderCustomer = async (billingUserId: string, providerAccountId: string) => {
  return await prisma.userPaymentProviderCustomer.findUnique({
    where: {
      billingUserId_providerAccountId: {
        billingUserId,
        providerAccountId,
      },
    },
  });
};

const getProviderAccount = async (accountId: string) => {
  const providerAccount = await prisma.paymentProviderAccount.findUnique({
    where: { id: accountId },
  });

  if (!providerAccount) {
    throw new Error("Provider account not found");
  }

  return providerAccount;
};

const handlePaymentProvider = async ({
  providerAccount,
  providerSubscriptionId,
}: {
  providerAccount: PaymentProviderAccount;
  providerSubscriptionId: string;
}) => {
  const providerType = providerAccount.provider;

  switch (providerType) {
    case PaymentProvider.STRIPE:
      return await stripeCancel({
        subscriptionId: providerSubscriptionId,
        providerAccount,
      });
    default:
      throw new Error("Unsupported provider");
  }
};
