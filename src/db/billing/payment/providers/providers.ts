import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

export const getPaymentProviders = createTransactionRunner(async (_, tx) => {
  return tx.paymentProviderAccount.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
}, "getPaymentProviders");

export const getPaymentProviderById = createTransactionRunner(async (id: string, tx) => {
  return tx.paymentProviderAccount.findUnique({
    where: { id },
  });
}, "getPaymentProviderById");

export const getPaymentProviderByCode = createTransactionRunner(async (code: string, tx) => {
  return tx.paymentProviderAccount.findUnique({
    where: { code },
  });
}, "getPaymentProviderByCode");

export const createPaymentProvider = createTransactionRunner(
  async (data: Prisma.PaymentProviderAccountCreateInput, tx) => {
    return tx.paymentProviderAccount.create({
      data,
    });
  },
  "createPaymentProvider"
);

export const updatePaymentProvider = createTransactionRunner(
  async (data: Prisma.PaymentProviderAccountUpdateInput, tx) => {
    return tx.paymentProviderAccount.update({
      where: { id: data.id as string },
      data: data,
    });
  },
  "updatePaymentProvider"
);

export const deletePaymentProvider = createTransactionRunner(async (id: string, tx) => {
  return tx.paymentProviderAccount.delete({
    where: { id },
  });
}, "deletePaymentProvider");
