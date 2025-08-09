import { PaymentProviderAccount, PeriodType } from "@/db/generated/prisma";
import { defaultLocale } from "@/i18n/locales";
import { upsertPeriodsPaymentProivderInfo } from "@/services/billing/payment/product/upsertPeriodsPaymentProivderInfo";
import { PlanGetPayloadWithDetail, PlanPeriodGetPayload } from "@/types/billing";
import Stripe from "stripe";
import { createStripeObject } from "./createStripeObject";

export const ensureStripePaymentProduct = async (
  provider: PaymentProviderAccount,
  plans: PlanGetPayloadWithDetail[]
) => {
  const { providerSecretKey } = provider;
  if (!providerSecretKey) {
    throw new Error("Provider secret key is required");
  }
  const stripe = createStripeObject(providerSecretKey);
  const product =
    (await searchExistingProduct(stripe, provider)) || (await createNewProduct(stripe, provider));
  const prices = await ensureEachPlanPeriods(stripe, provider, product, plans);

  await upsertPeriodsPaymentProivderInfo({
    providerAccountId: provider.id,
    periodsInfo: prices.map((price) => ({
      periodId: price.metadata.planPeriodId,
      providerPriceId: price.id,
    })),
  });
};

const searchExistingProduct = async (stripe: Stripe, provider: PaymentProviderAccount) => {
  const existingProducts = await stripe.products.search({
    query: `metadata['providerCode']:"${provider.code}" and active:"true"`,
  });
  return existingProducts.data.length > 0 ? existingProducts.data[0] : null;
};

const ensureEachPlanPeriods = async (
  stripe: Stripe,
  provider: PaymentProviderAccount,
  product: Stripe.Product,
  plans: PlanGetPayloadWithDetail[]
) => {
  const existingPrices = await stripe.prices.list({
    active: true,
    product: product.id,
    limit: 100,
  });
  const prices: Stripe.Price[] = [];
  for (const plan of plans) {
    for (const planPeriod of plan.planPeriods) {
      let price = existingPrices.data.find(
        (price) =>
          price.metadata.planCode === plan.code &&
          price.metadata.periodCode === planPeriod.periodCode
      );
      if (price) {
        if (await needDeactivatePrice(price, planPeriod)) {
          await deactivatePrice(stripe, price);
          price = undefined;
        } else {
          price = await updatePriceMetadata(stripe, price, plan, planPeriod);
        }
      }
      prices.push(price || (await createNewPrice(stripe, provider, product, plan, planPeriod)));
    }
  }
  return prices;
};

const updatePriceMetadata = async (
  stripe: Stripe,
  price: Stripe.Price,
  plan: PlanGetPayloadWithDetail,
  planPeriod: PlanPeriodGetPayload
) => {
  if (
    price.metadata.siteUrl === process.env.NEXT_PUBLIC_SITE_URL &&
    price.metadata.planId === plan.id &&
    price.metadata.planPeriodId === planPeriod.id &&
    price.metadata.planCode === plan.code &&
    price.metadata.periodCode === planPeriod.periodCode
  ) {
    return;
  }
  return await stripe.prices.update(price.id, {
    metadata: {
      updatedAt: new Date().toISOString(),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
      planId: plan.id,
      planPeriodId: planPeriod.id,
    },
  });
};

const needDeactivatePrice = async (
  existingPrice: Stripe.Price,
  planPeriod: PlanPeriodGetPayload
) => {
  return (
    existingPrice.unit_amount !== planPeriod.price ||
    existingPrice.currency.toLowerCase() !== planPeriod.currency.toLowerCase()
  );
};

const deactivatePrice = async (stripe: Stripe, price: Stripe.Price) => {
  try {
    await stripe.prices.update(price.id, {
      active: false,
    });
  } catch (error) {
    console.error(error);
  }
};

const createNewProduct = async (stripe: Stripe, provider: PaymentProviderAccount) => {
  return stripe.products.create({
    name: process.env.NEXT_PUBLIC_SITE_NAME || " SaaS Plans",
    description: process.env.NEXT_PUBLIC_SITE_NAME + " SaaS Plans",
    metadata: {
      providerId: provider.id,
      providerCode: provider.code,
      providerName: provider.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
    },
  });
};

const getPriceName = (plan: PlanGetPayloadWithDetail, planPeriod: PlanPeriodGetPayload) => {
  return (
    plan.translations.find((t) => t.locale === defaultLocale)?.nickname +
    (planPeriod.periodValue ? ` ${planPeriod.periodValue} ${planPeriod.periodType}` : "") +
    (planPeriod.resetPeriodValue
      ? ` / ${planPeriod.resetPeriodValue} ${planPeriod.resetPeriodType}`
      : "")
  );
};

const createNewPrice = async (
  stripe: Stripe,
  provider: PaymentProviderAccount,
  product: Stripe.Product,
  plan: PlanGetPayloadWithDetail,
  planPeriod: PlanPeriodGetPayload
) => {
  return stripe.prices.create({
    product: product.id,
    unit_amount: planPeriod.price,
    currency: planPeriod.currency.toLowerCase(),
    tax_behavior: process.env.STRIPE_TAX_BEHAVIOR as Stripe.Price.TaxBehavior,
    ...(isRecurring(planPeriod)
      ? {
          recurring: {
            interval: getInterval(planPeriod),
            interval_count: planPeriod.periodValue || 1,
          },
        }
      : {}),
    metadata: {
      providerId: provider.id,
      providerCode: provider.code,
      providerName: provider.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
      planId: plan.id,
      planCode: plan.code,
      planPeriodId: planPeriod.id,
      periodCode: planPeriod.periodCode,
      priceName: getPriceName(plan, planPeriod),
    },
  });
};

const isRecurring = (planPeriod: PlanPeriodGetPayload) => {
  return (
    planPeriod.periodType === PeriodType.MONTHS ||
    planPeriod.periodType === PeriodType.YEARS ||
    planPeriod.periodType === PeriodType.DAYS ||
    planPeriod.periodType === PeriodType.WEEKS
  );
};

const getInterval = (planPeriod: PlanPeriodGetPayload) => {
  switch (planPeriod.periodType) {
    case PeriodType.MONTHS:
      return "month";
    case PeriodType.YEARS:
      return "year";
    case PeriodType.WEEKS:
      return "week";
    case PeriodType.DAYS:
      return "day";
    default:
      return "month";
  }
};
