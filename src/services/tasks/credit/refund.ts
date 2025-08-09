import { CreditTransactionStatus, CreditTransactionType, TaskStatus } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
import { TaskListItem } from "@/types/tasks";
import { refundCredit } from "../../billing/credits/reverse/refund";
import { calculateRefundCredits } from "./calculate";

export function shouldProcessRefund(status: TaskStatus): boolean {
  return (
    status === TaskStatus.FAILED ||
    status === TaskStatus.PARTIALLY_COMPLETED ||
    status === TaskStatus.CANCELLED ||
    status === TaskStatus.ABORTED
  );
}

export async function processTaskCreditRefund(task: TaskListItem) {
  const creditTransaction = await prisma.creditTransaction.findFirst({
    where: {
      metadata: {
        path: ["taskId"],
        equals: task.id,
      },
      type: CreditTransactionType.DEDUCT,
      status: CreditTransactionStatus.CONFIRMED,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!creditTransaction) {
    console.warn(`Task ${task.id} not found credit transaction, skip credit refund`);
    return;
  }

  const existingRefundAmount = creditTransaction.refundAmount || 0;
  if (existingRefundAmount >= creditTransaction.totalAmount) {
    console.log(`Task ${task.id} credit already fully refunded, skip credit refund`);
    return;
  }

  const refundAmount = calculateRefundCredits(task);

  if (refundAmount > 0) {
    try {
      await refundCredit({
        originalTransactionId: creditTransaction.id,
        refundAmount,
        description: `Task ${task.id} failed, refund ${refundAmount} credits`,
      });

      console.log(`Task ${task.id} credit refund success: refund ${refundAmount} credits`);
    } catch (error) {
      console.error(`Task ${task.id} credit refund failed:`, error);
      throw error;
    }
  } else {
    console.log(`Task ${task.id} no credit refund needed`);
  }
}
