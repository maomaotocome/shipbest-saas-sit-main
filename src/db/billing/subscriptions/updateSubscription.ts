import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const handleUpdateSubscription = async (
  params: Prisma.SubscriptionUpdateInput,
  tx: Prisma.TransactionClient
) => {
  const { id, ...data } = params;
  const subscription = await tx.subscription.update({
    where: {
      id: id as string,
    },
    data,
  });

  return subscription;
};

export const updateSubscription = createTransactionRunner(
  handleUpdateSubscription,
  "updateSubscription"
);
