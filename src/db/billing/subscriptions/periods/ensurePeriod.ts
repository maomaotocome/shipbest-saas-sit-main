import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const handleEnsurePeriod = async (
  period: Prisma.SubscriptionPeriodUncheckedCreateInput,
  tx: Prisma.TransactionClient
) => {
  return tx.subscriptionPeriod.upsert({
    where: {
      subscriptionId_periodNumber: {
        subscriptionId: period.subscriptionId,
        periodNumber: period.periodNumber,
      },
    },
    create: period,
    update: period,
  });
};

export const ensurePeriod = createTransactionRunner(handleEnsurePeriod, "ensurePeriod");
