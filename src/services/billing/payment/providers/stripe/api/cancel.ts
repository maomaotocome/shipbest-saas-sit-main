import { PaymentProviderAccount } from "@/db/generated/prisma";
import { createStripeObject } from "./createStripeObject";

export const cancel = async ({
  subscriptionId,
  providerAccount,
}: {
  subscriptionId: string;
  providerAccount: PaymentProviderAccount;
}) => {
  if (!providerAccount.providerSecretKey) {
    throw new Error("Provider secret key is not set");
  }

  try {
    const stripe = createStripeObject(providerAccount.providerSecretKey);
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return subscription;
  } catch (error) {
    console.error("Error canceling Stripe subscription:", error);
    throw new Error("Failed to cancel Stripe subscription");
  }
};
