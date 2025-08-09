import { PaymentProviderAccount } from "@/db/generated/prisma";
import { createStripeObject } from "./createStripeObject";
export const refund = async ({
  providerAccount,
  providerInvoiceId,
  amount,
}: {
  providerAccount: PaymentProviderAccount;
  providerInvoiceId: string;
  amount?: number;
}) => {
  if (!providerAccount.providerSecretKey) {
    throw new Error("Provider secret key is not set");
  }
  const stripe = createStripeObject(providerAccount.providerSecretKey);
  const stripeInvoice = await stripe.invoices.retrieve(providerInvoiceId);
  const chargeId = stripeInvoice.charge as string;

  const refund = await stripe.refunds.create({
    charge: chargeId,
    ...(amount && { amount }),
  });

  return refund;
};
