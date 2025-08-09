import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const handleGetPlanPeriod = async (
  { periodsId }: { periodsId: string },
  tx: Prisma.TransactionClient
) => {
  const planPeriod = await tx.planPeriod.findUnique({
    where: {
      id: periodsId,
    },
  });
  return planPeriod;
};

export const getPlanPeriod = createTransactionRunner(handleGetPlanPeriod, "getPlanPeriod");
