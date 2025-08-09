import { getPaymentProviderByCode } from "@/db/billing/payment/providers/providers";
import { PaymentProviderAccount } from "@/db/generated/prisma";
import Stripe from "stripe";
import { createStripeObject } from "../../api/createStripeObject";
import { WebhookError } from "../errors/WebhookError";
import { constructStripeEvent } from "../utils/constructStripeEvent";
export class StripeWebhookInitializer {
  private stripe!: Stripe;
  private event!: Stripe.Event;
  private readonly accountCode: string;
  private readonly signature: string;
  private readonly rawBody: string;
  private account!: PaymentProviderAccount | null;

  constructor(accountCode: string, signature: string, rawBody: string) {
    if (!accountCode || !signature || !rawBody) {
      throw new Error("Missing required parameters");
    }
    this.accountCode = accountCode;
    this.signature = signature;
    this.rawBody = rawBody;
  }

  async initialize(): Promise<{
    stripe: Stripe;
    event: Stripe.Event;
    account: PaymentProviderAccount | null;
  }> {
    await this.initializeStripe();
    return { stripe: this.stripe, event: this.event, account: this.account };
  }

  private async initializeStripe(): Promise<void> {
    this.account = await getPaymentProviderByCode(this.accountCode);
    if (!this.account) {
      throw new WebhookError("Payment provider not found");
    }
    if (!this.account.providerSecretKey || !this.account.providerWebhookSecret) {
      throw new WebhookError("Missing configuration");
    }

    this.stripe = createStripeObject(this.account.providerSecretKey);

    this.event = await constructStripeEvent(
      this.rawBody,
      this.signature,
      this.account.providerWebhookSecret,
      this.stripe
    );
  }
}
