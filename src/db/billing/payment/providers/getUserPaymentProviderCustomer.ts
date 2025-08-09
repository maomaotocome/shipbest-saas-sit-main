import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";
const handleGetUserPaymentProviderCustomer = async (
  param: Prisma.UserPaymentProviderCustomerFindUniqueArgs,
  tx: Prisma.TransactionClient
) => {
  return await tx.userPaymentProviderCustomer.findUnique(param);
};

export const getUserPaymentProviderCustomer = createTransactionRunner(
  handleGetUserPaymentProviderCustomer
);
