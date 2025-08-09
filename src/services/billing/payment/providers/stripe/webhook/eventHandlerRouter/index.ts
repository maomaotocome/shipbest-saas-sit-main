import { WebhookError } from "../errors/WebhookError";
import { StripeWebhookEventRecorder } from "./StripeWebhookEventRecorder";
import { StripeWebhookInitializer } from "./StripeWebhookInitializer";
import { StripeWebhookProcessor } from "./StripeWebhookProcessor";

export class StripeWebhookEventHandler {
  private eventRecorder: StripeWebhookEventRecorder;
  private processor: StripeWebhookProcessor | null = null;
  private accountCode: string;
  private signature: string;
  private rawBody: string;

  constructor({
    accountCode,
    signature,
    rawBody,
  }: {
    accountCode: string;
    signature: string;
    rawBody: string;
  }) {
    if (!accountCode || !signature || !rawBody) {
      throw new Error("Missing required parameters");
    }
    this.accountCode = accountCode;
    this.signature = signature;
    this.rawBody = rawBody;
    this.eventRecorder = new StripeWebhookEventRecorder();
  }

  async initialize(): Promise<StripeWebhookEventHandler> {
    try {
      const initializer = new StripeWebhookInitializer(
        this.accountCode,
        this.signature,
        this.rawBody
      );
      const { stripe, event, account } = await initializer.initialize();
      if (!account) {
        throw new WebhookError("Payment provider not found");
      }
      await this.eventRecorder.recordEvent(event, account.id);
      this.processor = new StripeWebhookProcessor(stripe, event, account.id, this.eventRecorder);

      return this;
    } catch (error) {
      console.error("Webhook initialization error:", error);
      if (error instanceof WebhookError) {
        throw error;
      }
      throw new WebhookError("Failed to initialize webhook handler");
    }
  }

  async handleEvent(): Promise<{ message: string; type: string }> {
    if (!this.processor) {
      throw new WebhookError("Webhook handler not initialized");
    }

    return this.processor.processEvent();
  }
}
