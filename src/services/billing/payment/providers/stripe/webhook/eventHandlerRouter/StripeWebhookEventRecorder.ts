import {
  insertWebhookEventAndLog,
  updateWebhookEventAndLog,
  WebhookDuplicateError,
} from "@/db/billing/payment/webhook";
import { PaymentProvider, WebhookEvent, WebhookEventStatus } from "@/db/generated/prisma";
import { Stripe } from "stripe";
import { WebhookError } from "../errors/WebhookError";

export class StripeWebhookEventRecorder {
  private webhookEvent: WebhookEvent | null = null;

  async recordEvent(event: Stripe.Event, accountId: string): Promise<WebhookEvent> {
    try {
      const webhookEventAndLog = await insertWebhookEventAndLog({
        eventId: event.id,
        type: event.type,
        provider: PaymentProvider.STRIPE,
        accountId: accountId,
        rawEvent: JSON.stringify(event),
        status: WebhookEventStatus.PENDING,
      });
      this.webhookEvent = webhookEventAndLog?.event;
      return this.webhookEvent;
    } catch (error) {
      if (error instanceof WebhookDuplicateError) {
        console.log(`Duplicate webhook event received: ${event.id}`);
        throw new WebhookError(error.message);
      }
      throw error;
    }
  }

  async updateEventStatus(
    status: WebhookEventStatus,
    message: string,
    error?: string
  ): Promise<void> {
    if (!this.webhookEvent) {
      throw new Error("No webhook event to update");
    }

    await updateWebhookEventAndLog({
      webhookId: this.webhookEvent.id,
      status,
      message,
      error,
      processedAt: new Date(),
    });
  }

  getWebhookEvent(): WebhookEvent | null {
    return this.webhookEvent;
  }
}
