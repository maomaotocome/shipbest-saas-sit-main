import Stripe from "stripe";
import { PrismaClient } from "../../src/db/generated/prisma/";
const prisma = new PrismaClient();

export async function clear() {
  const providerAccount = await prisma.paymentProviderAccount.findFirst({
    where: {
      code: "dream-stripe",
    },
  });
  if (!providerAccount) {
    throw new Error("Provider account not found");
  }
  const stripe = new Stripe(providerAccount.providerSecretKey || "", {
    typescript: true,
  });
  const testCustomer = await stripe.customers.list();
  for (const customer of testCustomer.data) {
    console.log(`Deleting test customer ${customer.id}`);
    await stripe.customers.del(customer.id);
  }
  const subscriptions = await stripe.subscriptions.list();
  for (const subscription of subscriptions.data) {
    console.log(`Cancelling subscription ${subscription.id}`);
    await stripe.subscriptions.cancel(subscription.id);
  }
  const customers = await stripe.customers.list();
  for (const customer of customers.data) {
    console.log(`Deleting customer ${customer.id}`);
    await stripe.customers.del(customer.id);
  }
  const testClocks = await stripe.testHelpers.testClocks.list();
  for (const testClock of testClocks.data) {
    console.log(`Deleting test clock ${testClock.id}`);
    await stripe.testHelpers.testClocks.del(testClock.id);
  }

  await prisma.userPaymentProviderCustomer.deleteMany({
    where: {
      providerAccountId: providerAccount.id,
    },
  });
  await prisma.subscriptionPeriod.deleteMany({
    where: {
      subscription: {
        providerAccountId: providerAccount.id,
      },
    },
  });
  await prisma.subscription.deleteMany({
    where: {
      providerAccountId: providerAccount.id,
    },
  });
  console.log("done");
}
