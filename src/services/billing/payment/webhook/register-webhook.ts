import { getPaymentProviderById } from "@/db/billing/payment/providers/providers";
import { PaymentProvider } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
import { registerWebhook as stripeRegisterWebhook } from "@/services/billing/payment/providers/stripe/api/register-webhook";

export async function registerWebhook(providerAccountId: string) {
  const provider = await getPaymentProviderById(providerAccountId);
  let result;
  switch (provider?.provider) {
    case PaymentProvider.STRIPE:
      result = await stripeRegisterWebhook(provider);
      break;
    case PaymentProvider.PADDLE:
    case PaymentProvider.LEMON_SQUEEZY:
    default:
      throw new Error("Unsupported provider");
  }
  await prisma.paymentProviderAccount.update({
    where: { id: providerAccountId },
    data: {
      providerWebhookId: result.id,
      providerWebhookSecret: result.secret,
    },
  });
  return result;
}
