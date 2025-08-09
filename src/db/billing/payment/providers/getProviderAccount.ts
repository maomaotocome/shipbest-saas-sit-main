import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const handleGetProviderAccount = async (
  param: Prisma.PaymentProviderAccountFindUniqueArgs,
  tx: Prisma.TransactionClient
) => {
  const providerAccount = await tx.paymentProviderAccount.findUnique(param);
  return providerAccount;
};

export const getProviderAccount = createTransactionRunner(handleGetProviderAccount);
