import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const createCreditTransactionHandler = async (
  data: Prisma.CreditTransactionCreateInput,
  tx: Prisma.TransactionClient
) => {
  return tx.creditTransaction.create({ data });
};

export const createCreditTransaction = createTransactionRunner(
  createCreditTransactionHandler,
  "createCreditTransaction"
);
