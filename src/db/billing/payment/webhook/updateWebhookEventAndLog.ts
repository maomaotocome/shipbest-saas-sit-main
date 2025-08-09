import { WebhookEventStatus } from "@/db/generated/prisma";
import { withTransaction } from "@/lib/prisma";

interface UpsertWebhookEventAndLogParams {
  webhookId: string;
  status: WebhookEventStatus;
  message?: string;
  error?: string;
  processedAt?: Date;
}

export async function updateWebhookEventAndLog(params: UpsertWebhookEventAndLogParams) {
  const { webhookId, status, message, error, processedAt } = params;

  try {
    return await withTransaction(async (tx) => {
      // 1. Update event status
      const event = await tx.webhookEvent.update({
        where: { id: webhookId },
        data: {
          status,
          error,
          processedAt,
          attempts: {
            increment: 1,
          },
          updatedAt: new Date(),
        },
      });

      // 2. Create event log
      const log = await tx.webhookEventLog.create({
        data: {
          webhookId,
          status,
          message,
          error,
        },
      });
      return { event, log };
    });
  } catch (error) {
    // Rethrow error for upper layer handling
    throw error;
  }
}
