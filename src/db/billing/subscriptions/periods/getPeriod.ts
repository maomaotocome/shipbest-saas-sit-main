import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const handleGetPeriod = async (
  params: Prisma.SubscriptionPeriodWhereUniqueInput,
  tx: Prisma.TransactionClient
) => {
  const period = await tx.subscriptionPeriod.findUnique({
    where: params,
  });

  return period;
};

export const getPeriod = createTransactionRunner(handleGetPeriod, "getPeriod");
