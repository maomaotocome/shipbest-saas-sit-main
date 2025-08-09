import { PaymentProvider, WebhookEventStatus } from "@/db/generated/prisma";
import { withTransaction } from "@/lib/prisma";

interface InsertWebhookEventAndLogParams {
  eventId: string;
  type: string;
  provider: PaymentProvider;
  accountId: string;
  rawEvent: string;
  status: WebhookEventStatus;
}

export class WebhookDuplicateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookDuplicateError";
  }
}

export async function insertWebhookEventAndLog(params: InsertWebhookEventAndLogParams) {
  const { eventId, type, provider, accountId, rawEvent, status } = params;

  return await withTransaction(async (tx) => {
    const existingEvent = await tx.webhookEvent.findUnique({
      where: {
        provider_eventId: {
          provider,
          eventId,
        },
      },
    });

    if (existingEvent) {
      throw new WebhookDuplicateError(`Webhook event already exists: ${eventId}`);
    }

    const event = await tx.webhookEvent.create({
      data: {
        eventId,
        eventType: type,
        provider,
        providerAccountId: accountId,
        payload: rawEvent,
        status,
        attempts: 0,
      },
    });

    const log = await tx.webhookEventLog.create({
      data: {
        webhookId: event.id,
        status,
        message: `Received ${type} event from ${provider}`,
      },
    });

    return { event, log };
  });
}
