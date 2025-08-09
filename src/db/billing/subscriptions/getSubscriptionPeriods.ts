import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const handleGetSubscriptionPeriods = async (
  params: Prisma.SubscriptionPeriodFindManyArgs,
  tx: Prisma.TransactionClient
) => {
  const subscriptionPeriods = await tx.subscriptionPeriod.findMany(params);

  return subscriptionPeriods;
};

export const getSubscriptionPeriods = createTransactionRunner(
  handleGetSubscriptionPeriods,
  "getSubscriptionPeriods"
);
