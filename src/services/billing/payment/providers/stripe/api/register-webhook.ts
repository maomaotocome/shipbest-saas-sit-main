import { PaymentProviderAccount } from "@/db/generated/prisma";
import { createStripeObject } from "./createStripeObject";

export const registerWebhook = async (provider: PaymentProviderAccount) => {
  const { code, providerSecretKey } = provider;
  if (!providerSecretKey) {
    throw new Error("Provider secret key is required");
  }
  const stripe = createStripeObject(providerSecretKey);
  const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/billing/payment/webhook/stripe/${code}`;

  const webhook = provider.providerWebhookId
    ? await stripe.webhookEndpoints.update(provider.providerWebhookId, {
        url: webhookUrl,
        enabled_events: ["*"],
      })
    : await stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: ["*"],
      });
  return { id: webhook.id, secret: webhook.secret };
};
