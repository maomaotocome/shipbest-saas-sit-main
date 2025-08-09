import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const handleGetOrCreateSubscription = async (
  subscription: Prisma.SubscriptionUncheckedCreateInput,
  tx: Prisma.TransactionClient
) => {
  return tx.subscription.upsert({
    where: {
      providerAccountId_providerSubscriptionId: {
        providerAccountId: subscription.providerAccountId,
        providerSubscriptionId: subscription.providerSubscriptionId,
      },
    },
    create: {
      ...subscription,
      periods: {
        create: [{ periodNumber: 1, startDate: new Date(), endDate: new Date() }],
      },
    },
    update: subscription,
    include: {
      periods: true,
    },
  });
};

export const getOrCreateSubscription = createTransactionRunner(
  handleGetOrCreateSubscription,
  "getOrCreateSubscription"
);
