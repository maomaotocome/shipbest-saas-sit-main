"use server";
import { getAllFeatures } from "@/db/billing/features";
import { getPlans } from "@/db/billing/plans";
import { Locale } from "@/i18n/locales";
import { getLocale } from "next-intl/server";
import { unstable_cache } from "next/cache";

const getPlansWithCache = unstable_cache(
  async (locale: Locale) => await getPlans({ locale, includeInactive: false }),
  ["pricing-plans"],
  {
    revalidate: 60 * 60, // 1 hour
  }
);

const getFeaturesWithCache = unstable_cache(
  async (locale: Locale) => await getAllFeatures(locale),
  ["pricing-features"],
  {
    revalidate: 60 * 60, // 1 hour
  }
);

export async function getPlansData() {
  const locale = (await getLocale()) as Locale;

  const [plans, features] = await Promise.all([
    getPlansWithCache(locale),
    getFeaturesWithCache(locale),
  ]);

  return {
    plans,
    features,
  };
}
