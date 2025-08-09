import Stripe from "stripe";
export function createStripeObject(providerSecretKey: string): Stripe {
  if (!providerSecretKey) {
    throw new Error("Stripe secret key is required");
  }
  return new Stripe(providerSecretKey, {
    typescript: true,
  });
}
