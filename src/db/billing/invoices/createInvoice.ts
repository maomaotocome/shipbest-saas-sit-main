import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const createInvoiceHandler = async (
  params: Prisma.InvoiceUncheckedCreateInput,
  tx: Prisma.TransactionClient
) => {
  return tx.invoice.create({
    data: params,
  });
};

export const createInvoice = createTransactionRunner(createInvoiceHandler, "createInvoice");
