import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

type SubscriptionWithPeriods = Prisma.SubscriptionGetPayload<{
  include: {
    periods: true;
  };
}>;

const handleGetSubscription = async (
  data: Prisma.SubscriptionFindUniqueArgs,
  tx: Prisma.TransactionClient
): Promise<SubscriptionWithPeriods | null> => {
  return await tx.subscription.findUnique({
    ...data,
    include: {
      periods: true,
    },
  });
};

export const getSubscription = createTransactionRunner(handleGetSubscription, "getSubscription");
