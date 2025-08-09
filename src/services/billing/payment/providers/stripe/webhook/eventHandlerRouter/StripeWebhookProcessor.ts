import { WebhookEventStatus } from "@/db/generated/prisma";
import { Stripe } from "stripe";
import { eventHandlers, StripeEventType } from "../eventHandlers";
import { BaseWebhookEventHandler } from "../eventHandlers/BaseWebhookEventHandler";
import { StripeWebhookEventRecorder } from "./StripeWebhookEventRecorder";

export class StripeWebhookProcessor {
  constructor(
    private readonly stripe: Stripe,
    private readonly event: Stripe.Event,
    private readonly accountId: string,
    private readonly eventRecorder: StripeWebhookEventRecorder
  ) {}

  async processEvent(): Promise<{ message: string; type: string }> {
    try {
      const eventType = this.event.type as StripeEventType;
      const HandlerClass = eventHandlers[eventType];

      if (!HandlerClass) {
        await this.handleIgnoredEvent(eventType);
      } else {
        await this.processWithHandler(HandlerClass);
      }

      return { message: "Processed successfully", type: this.event.type };
    } catch (error) {
      await this.eventRecorder.updateEventStatus(
        WebhookEventStatus.FAILED,
        "Failed to process webhook event",
        error instanceof Error ? error.message : "Unknown error"
      );
      console.error("Event handling error:", error);
      throw error;
    }
  }

  private async processWithHandler(
    HandlerClass: new (stripe: Stripe, accountId: string) => BaseWebhookEventHandler
  ): Promise<void> {
    const handler = new HandlerClass(this.stripe, this.accountId);
    await handler.handle(this.event);
    await this.eventRecorder.updateEventStatus(
      WebhookEventStatus.COMPLETED,
      `Successfully processed ${this.event.type} event`
    );
  }

  private async handleIgnoredEvent(eventType: string): Promise<void> {
    await this.eventRecorder.updateEventStatus(
      WebhookEventStatus.IGNORED,
      `No handler found for event type: ${eventType}`
    );
    console.log(`No handler found for event type: ${eventType}`);
  }
}
