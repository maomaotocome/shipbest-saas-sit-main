import {
  PaymentProviderAccount,
  PeriodType,
  PlanPeriod,
  PlanPeriodProviderConfig,
  UserPaymentProviderCustomer,
} from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";
import { prisma } from "@/lib/prisma";
import { JsonObject } from "@/types/json";
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";
import { CheckoutSessionMode } from "../types";
import { createStripeObject } from "./createStripeObject";
export const order = async ({
  email,
  billingUserId,
  orderId,
  providerAccount,
  userPaymentProviderCustomer,
  planPeriodProviderConfig,
  planPeriod,
  urls,
  ipAddress,
  countryCode,
  utmData,
}: {
  email: string;
  billingUserId: string;
  orderId: string;
  userPaymentProviderCustomer?: UserPaymentProviderCustomer;
  providerAccount: PaymentProviderAccount;
  planPeriodProviderConfig: PlanPeriodProviderConfig;
  planPeriod: PlanPeriod;
  urls: {
    successUrl: string;
    billingUrl: string;
  };
  locale: Locale;
  ipAddress: string;
  countryCode: string;
  utmData?: JsonObject;
}) => {
  if (!providerAccount.providerSecretKey) {
    throw new Error("Provider secret key is not set");
  }

  const stripe = createStripeObject(providerAccount.providerSecretKey);
  console.log("stripe", stripe);

  // Get or create Stripe customer
  const stripeCustomer = await getOrCreateStripeCustomer(stripe, email);
  console.log("stripeCustomer", stripeCustomer);

  // Get or create payment provider customer record
  const paymentProviderCustomer = await getOrCreatePaymentProviderCustomer(
    stripeCustomer.id,
    billingUserId,
    providerAccount.id,
    userPaymentProviderCustomer
  );
  console.log("paymentProviderCustomer", paymentProviderCustomer);
  // Determine checkout mode
  const mode = getCheckoutSessionMode(planPeriod);

  // Prepare metadata
  const metadata = {
    pervoider: providerAccount.id,
    billingUserId: billingUserId,
    planId: planPeriod.planId,
    periodId: planPeriod.id,
    periodType: planPeriod.periodType,
    orderId,
    ipAddress,
    countryCode,
    ...(utmData ? { utmData: JSON.stringify(utmData) } : {}),
  };

  // Build and create checkout session
  const sessionConfig = buildSessionConfig(
    stripe,
    mode,
    planPeriodProviderConfig.providerPriceId,
    paymentProviderCustomer.providerCustomerId,
    urls,
    metadata,
    planPeriod
  );
  console.log("sessionConfig", sessionConfig);
  const session = await stripe.checkout.sessions.create(sessionConfig);
  return { url: session.url, id: session.id };
};

const getOrCreateStripeCustomer = async (stripe: Stripe, email: string) => {
  const existingCustomers = await stripe.customers.search({
    query: `email:"${email}"`,
  });

  return existingCustomers.data[0] || (await stripe.customers.create({ email }));
};

const getOrCreatePaymentProviderCustomer = async (
  providerCustomerId: string,
  billingUserId: string,
  providerAccountId: string,
  existingCustomer?: UserPaymentProviderCustomer
) => {
  if (existingCustomer && existingCustomer.providerCustomerId === providerCustomerId) {
    return existingCustomer;
  }

  return await prisma.userPaymentProviderCustomer.upsert({
    where: {
      id: existingCustomer?.id || uuidv4(),
    },
    update: {
      billingUserId,
      providerAccountId,
      providerCustomerId,
    },
    create: {
      billingUserId,
      providerAccountId,
      providerCustomerId,
    },
  });
};

const buildSessionConfig = (
  stripe: Stripe,
  mode: CheckoutSessionMode,
  providerPriceId: string,
  customerId: string,
  urls: { successUrl: string; billingUrl: string },
  metadata: Record<string, string | number | null>,
  planPeriod: PlanPeriod
): Stripe.Checkout.SessionCreateParams => {
  const config: Stripe.Checkout.SessionCreateParams = {
    line_items: [{ price: providerPriceId, quantity: 1 }],
    mode,
    success_url: urls.successUrl,
    cancel_url: urls.billingUrl,
    metadata,
    allow_promotion_codes: true,
    customer: customerId,
  };

  if (mode === CheckoutSessionMode.PAYMENT) {
    const description = `${process.env.NEXT_PUBLIC_SITE_NAME} Payment for ${planPeriod.periodValue} ${planPeriod.periodType}`;
    config.invoice_creation = {
      enabled: true,
      invoice_data: { description },
    };
  }

  return config;
};

const getCheckoutSessionMode = (planPeriod: PlanPeriod) => {
  return planPeriod.periodType === PeriodType.ONE_TIME ||
    planPeriod.periodType === PeriodType.LIFETIME
    ? CheckoutSessionMode.PAYMENT
    : CheckoutSessionMode.SUBSCRIPTION;
};
