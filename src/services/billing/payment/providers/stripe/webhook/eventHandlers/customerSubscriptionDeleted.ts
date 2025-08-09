import { getSubscription } from "@/db/billing/subscriptions/getSubscription";
import { updateSubscription } from "@/db/billing/subscriptions/updateSubscription";
import { SubscriptionStatus } from "@/db/generated/prisma";
import type Stripe from "stripe";
import { BaseWebhookEventHandler } from "./BaseWebhookEventHandler";

export class CustomerSubscriptionDeletedHandler extends BaseWebhookEventHandler {
  public readonly eventType = "customer.subscription.deleted";

  async handle(event: Stripe.Event): Promise<void> {
    const stripeSubscription = event.data.object as Stripe.Subscription;
    const stripeSubscriptionId = stripeSubscription.id;
    const subscription = await getSubscription({
      where: {
        providerAccountId_providerSubscriptionId: {
          providerAccountId: this.accountId,
          providerSubscriptionId: stripeSubscriptionId,
        },
      },
    });

    if (!subscription) {
      return;
    }

    await updateSubscription({
      id: subscription.id,
      status: SubscriptionStatus.CANCELLED,
      canceledAt: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : undefined,
    });
  }
}
