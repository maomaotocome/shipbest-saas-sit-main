import { getProviderAccount } from "@/db/billing/payment/providers/getProviderAccount";
import { getUserPaymentProviderCustomer } from "@/db/billing/payment/providers/getUserPaymentProviderCustomer";
import { getPlan } from "@/db/billing/plans";
import { getOrCreateBillingUserByUserId } from "@/db/billing/users";
import {
  BillingUser,
  PaymentProvider,
  PaymentProviderAccount,
  PeriodType,
  PlanPeriod,
  PlanPeriodProviderConfig,
  Prisma,
  UserPaymentProviderCustomer,
} from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";
import { OrderType } from "@/types/billing/order";
import { type JsonObject } from "@/types/json";
import { v4 as uuidv4 } from "uuid";
import { order as stripeOrder } from "../providers/stripe/api/order";

export const order = async ({
  userId,
  email,
  planId,
  periodId,
  locale,
  ipAddress,
  countryCode,
  utmData,
}: {
  userId: string;
  email: string;
  planId: string;
  periodId: string;
  locale: Locale;
  ipAddress: string;
  countryCode: string;
  utmData?: JsonObject;
}) => {
  const billingUser = await getOrCreateBillingUserByUserId({ userId });
  if (!email) {
    throw new Error("User email not found");
  }

  const planWithPeriodAndProviderPriceConfig = (await getPlan({
    where: { id: planId },
    include: {
      planPeriods: {
        where: { id: periodId },
        include: {
          providerPriceConfigs: {
            where: { isActive: true },
          },
        },
      },
    },
  })) as Prisma.PlanGetPayload<{
    include: {
      planPeriods: {
        include: {
          providerPriceConfigs: true;
        };
      };
    };
  }>;
  console.log("planWithPeriodAndProviderPriceConfig", planWithPeriodAndProviderPriceConfig);
  if (!planWithPeriodAndProviderPriceConfig) {
    throw new Error("Plan not found");
  }
  const { planPeriods } = planWithPeriodAndProviderPriceConfig;
  const { providerPriceConfigs } = planPeriods[0];

  const planPeriodProviderConfig = providerPriceConfigs.length > 0 ? providerPriceConfigs[0] : null;
  if (!planPeriodProviderConfig) {
    throw new Error("Provider price config not found");
  }

  const providerAccount = await getProviderAccount({
    where: { id: planPeriodProviderConfig.accountId },
  });
  console.log("providerAccount", providerAccount);
  if (!providerAccount) {
    throw new Error("Provider account not found");
  }
  const userPaymentProviderCustomer = await getUserPaymentProviderCustomer({
    where: {
      billingUserId_providerAccountId: {
        billingUserId: billingUser.id,
        providerAccountId: providerAccount.id,
      },
    },
  });
  console.log("userPaymentProviderCustomer", userPaymentProviderCustomer);
  return handlePaymentProvider({
    providerAccount,
    planPeriodProviderConfig,
    planPeriod: planPeriods[0],
    billingUser,
    email,
    locale,
    userPaymentProviderCustomer: userPaymentProviderCustomer || undefined,
    ipAddress,
    countryCode,
    utmData,
  });
};

const getOrderType = (planPeriod: PlanPeriod) => {
  return planPeriod.periodType === PeriodType.ONE_TIME ||
    planPeriod.periodType === PeriodType.LIFETIME
    ? OrderType.Purchase
    : OrderType.Subscribe;
};

const handlePaymentProvider = async ({
  providerAccount,
  planPeriodProviderConfig,
  planPeriod,
  billingUser,
  email,
  locale,
  userPaymentProviderCustomer,
  ipAddress,
  countryCode,
  utmData,
}: {
  providerAccount: PaymentProviderAccount;
  planPeriodProviderConfig: PlanPeriodProviderConfig;
  planPeriod: PlanPeriod;
  billingUser: BillingUser;
  email: string;
  locale: Locale;
  userPaymentProviderCustomer?: UserPaymentProviderCustomer;
  ipAddress: string;
  countryCode: string;
  utmData?: JsonObject;
}) => {
  const providerType = providerAccount.provider;

  const orderId = uuidv4();
  const orderType = getOrderType(planPeriod);

  switch (providerType) {
    case PaymentProvider.STRIPE:
      return await stripeOrder({
        email,
        billingUserId: billingUser.id,
        providerAccount,
        planPeriodProviderConfig,
        userPaymentProviderCustomer,
        planPeriod,
        urls: {
          successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/user/thanks?orderType=${orderType}&orderId=${orderId}`,
          billingUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/user/invoices`,
        },
        locale,
        orderId,
        ipAddress,
        countryCode,
        utmData,
      });
    default:
      throw new Error("Unsupported provider");
  }
};
