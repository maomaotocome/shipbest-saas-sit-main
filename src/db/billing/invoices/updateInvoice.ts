import { Prisma } from "@/db/generated/prisma";
import { createTransactionRunner } from "@/lib/prisma";

const updateInvoiceHandler = async (
  params: Prisma.InvoiceUpdateInput,
  tx: Prisma.TransactionClient
) => {
  return tx.invoice.update({
    where: { id: params.id as string },
    data: params,
  });
};

export const updateInvoice = createTransactionRunner(updateInvoiceHandler, "updateInvoice");
