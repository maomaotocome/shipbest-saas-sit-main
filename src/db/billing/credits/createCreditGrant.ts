import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const createCreditGrantHandler = async (
  data: Prisma.CreditGrantCreateInput,
  tx: Prisma.TransactionClient
) => {
  return tx.creditGrant.create({
    data,
  });
};

export const createCreditGrant = createTransactionRunner(
  createCreditGrantHandler,
  "createCreditGrant"
);
