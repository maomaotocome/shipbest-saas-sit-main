import { getSubscription } from "@/db/billing/subscriptions/getSubscription";
import { updateSubscription } from "@/db/billing/subscriptions/updateSubscription";
import type Stripe from "stripe";
import { BaseWebhookEventHandler } from "./BaseWebhookEventHandler";

export class CustomerSubscriptionUpdatedHandler extends BaseWebhookEventHandler {
  public readonly eventType = "customer.subscription.updated";

  async handle(event: Stripe.Event) {
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
    if (stripeSubscription.cancel_at_period_end) {
      await updateSubscription({
        id: subscription.id,
        cancelAtPeriodEnd: true,
        cancelAt: stripeSubscription.cancel_at
          ? new Date(stripeSubscription.cancel_at * 1000)
          : undefined,
      });
    }
  }
}
