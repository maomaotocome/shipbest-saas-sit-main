import Pricing from "@/components/sections/common/pricing";
import { Locale } from "@/i18n/locales";
import { getMetadata } from "@/lib/metadata";
import { getStaticData } from "@/staticData";
import { getLocale } from "next-intl/server";

export const revalidate = 3600;
export const generateMetadata = async () => {
  const locale = (await getLocale()) as Locale;
  const { title, description, keywords } = await getStaticData({
    locale,
    key: "metadata",
    type: "pricing",
  });
  return getMetadata({
    params: { title, description, keywords, uri: "/pricing" },
  });
};
export default async function PricingPage() {
  return <Pricing headingLevel={1} />;
}
