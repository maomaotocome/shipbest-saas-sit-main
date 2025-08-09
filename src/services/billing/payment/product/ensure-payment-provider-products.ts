import { getPaymentProviderById } from "@/db/billing/payment/providers/providers";
import { getPlans } from "@/db/billing/plans";
import { PaymentProvider } from "@/db/generated/prisma";
import { ensureStripePaymentProduct } from "@/services/billing/payment/providers/stripe/api/ensureProduct";

export const ensurePaymentProviderProducts = async (providerId: string) => {
  const provider = await getPaymentProviderById(providerId);
  if (!provider) {
    throw new Error("Provider not found");
  }
  const { providerSecretKey } = provider;
  if (!providerSecretKey) {
    throw new Error("Provider secret key is required");
  }
  const plans = await getPlans({ includeInactive: true });
  switch (provider.provider) {
    case PaymentProvider.STRIPE:
      await ensureStripePaymentProduct(provider, plans);
      break;
    default:
      throw new Error("Provider not supported");
  }
};
