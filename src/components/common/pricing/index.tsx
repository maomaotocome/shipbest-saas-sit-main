"use server";
import { getAllFeatures } from "@/db/billing/features";
import { getPlans } from "@/db/billing/plans";
import { Locale } from "@/i18n/locales";
import { getLocale } from "next-intl/server";
import { unstable_cache } from "next/cache";
import ClientPricing from "./Client";
import { Period, ViewMode } from "./PeriodToggle";

const getPlansWithCache = unstable_cache(
  async ({ locale, withDefaultLocale }: { locale: Locale; withDefaultLocale: boolean }) =>
    await getPlans({ locale, includeInactive: true, withDefaultLocale }),
  ["plans"],
  {
    revalidate: 60 * 60,
  }
);

const getFeaturesWithCache = unstable_cache(
  async ({ locale, withDefaultLocale }: { locale: Locale; withDefaultLocale: boolean }) =>
    await getAllFeatures(locale, withDefaultLocale),
  ["features"],
  {
    revalidate: 60 * 60,
  }
);

interface PricingProps {
  view?: ViewMode | "both";
  periodFilters?: Period[];
}

export default async function Pricing({ view = "both", periodFilters = [] }: PricingProps) {
  const locale = (await getLocale()) as Locale;
  const [plans, features] = await Promise.all([
    getPlansWithCache({ locale, withDefaultLocale: true }),
    getFeaturesWithCache({ locale, withDefaultLocale: true }),
  ]);
  return (
    <ClientPricing plans={plans} features={features} view={view} periodFilters={periodFilters} />
  );
}
