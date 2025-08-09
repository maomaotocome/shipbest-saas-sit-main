import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export interface IWebhookEventHandler {
  handle(event: Stripe.Event): Promise<void>;
}

export abstract class BaseWebhookEventHandler implements IWebhookEventHandler {
  protected stripe: Stripe;
  protected accountId: string;
  protected prisma = prisma;

  constructor(stripe: Stripe, accountId: string) {
    this.stripe = stripe;
    this.accountId = accountId;
  }

  abstract handle(event: Stripe.Event): Promise<void>;
}
