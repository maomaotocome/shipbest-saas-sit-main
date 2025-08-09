import Stripe from "stripe";

export async function constructStripeEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string,
  stripe: Stripe
): Promise<Stripe.Event> {
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("❌ Failed to construct Stripe event:", error);
    throw error;
  }
}
