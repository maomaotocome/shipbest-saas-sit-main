import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const getInvoiceHandler = async (
  params: Prisma.InvoiceWhereUniqueInput,
  tx: Prisma.TransactionClient
) => {
  return tx.invoice.findUnique({
    where: params,
  });
};

export const getInvoice = createTransactionRunner(getInvoiceHandler, "getInvoice");
