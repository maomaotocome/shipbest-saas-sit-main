import Stripe from "stripe";
import { PrismaClient } from "../../src/db/generated/prisma/";
import { clear } from "./clear";
const open = import("open");
const prisma = new PrismaClient();

async function main() {
  await clear();
  const user = await prisma.user.findFirst({});
  if (!user) {
    throw new Error("User not found");
  }
  const providerAccount = await prisma.paymentProviderAccount.findFirst({
    where: {
      code: "dream-stripe",
    },
  });
  const billingUser = await prisma.billingUser.upsert({
    where: {
      userId: user.id,
    },
    update: {},
    create: {
      userId: user.id,
    },
  });

  if (!providerAccount) {
    throw new Error("Provider account not found");
  }

  // Create a Stripe client
  const stripe = new Stripe(providerAccount.providerSecretKey || "", {
    typescript: true,
  });

  // Create a test clock for testing subscriptions
  const testClock = await stripe.testHelpers.testClocks.create({
    frozen_time: Math.floor(Date.now() / 1000),
  });

  console.log(`Created test clock: ${testClock.id}`);

  // Find a yearly plan with monthly reset
  const yearlyPlan = await prisma.planPeriod.findFirst({
    where: {
      periodType: "YEARS",
      resetPeriodType: "MONTHS",
      isActive: true,
    },
    include: {
      plan: true,
      providerPriceConfigs: {
        where: {
          accountId: providerAccount.id,
          isActive: true,
        },
      },
    },
  });

  if (!yearlyPlan) {
    throw new Error("No yearly plan with monthly reset found");
  }

  console.log(`Found plan: ${yearlyPlan.plan.code}, period: ${yearlyPlan.periodType}`);

  if (yearlyPlan.providerPriceConfigs.length === 0) {
    throw new Error(`No Stripe price config found for plan period ID: ${yearlyPlan.id}`);
  }

  const priceConfig = yearlyPlan.providerPriceConfigs[0];

  // Create a customer with the test clock
  const testCustomer = await stripe.customers.create({
    email: user.email || "",
    name: user.name || "",
    test_clock: testClock.id,
    payment_method: "pm_card_visa",
    invoice_settings: {
      default_payment_method: "pm_card_visa",
    },
  });

  console.log(`Created test customer: ${testCustomer.id}`);

  // Store the customer in our database linked to the billing user
  const userPaymentProviderCustomer = await prisma.userPaymentProviderCustomer.create({
    data: {
      billingUserId: billingUser.id,
      providerAccountId: providerAccount.id,
      providerCustomerId: testCustomer.id,
    },
  });

  console.log(`Created user payment provider customer record: ${userPaymentProviderCustomer.id}`);

  // Create checkout session for subscription
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: testCustomer.id,
    line_items: [
      {
        price: priceConfig.providerPriceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/en/user/invoices`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/en/user/invoices`,
    metadata: {
      provider: providerAccount.id,
      billingUserId: billingUser.id,
      planId: yearlyPlan.planId,
      periodId: yearlyPlan.id,
      periodType: yearlyPlan.periodType,
    },
    allow_promotion_codes: true,
  });
  // open browser to checkoutSession.url
  (await open).default(checkoutSession.url || "");
  console.log(checkoutSession);
}

main()
  .catch((e) => {
    console.error("Error testing subscription:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
