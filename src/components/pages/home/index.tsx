import LatestPosts from "@/components/sections/blog/latest";
import Carousel from "@/components/sections/common/carousel";
import Counter from "@/components/sections/common/counter";
import FAQ from "@/components/sections/common/faq";
import Features from "@/components/sections/common/features";
import Pricing from "@/components/sections/common/pricing";
import { Showcase } from "@/components/sections/common/showcase";
import Testimonial from "@/components/sections/common/testimonial";
import Usage from "@/components/sections/common/usage";
import Hero from "@/components/sections/home/hero";
import { Locale } from "@/i18n/locales";
import { getMetadata } from "@/lib/metadata";
import { getStaticData } from "@/staticData";
import { getLocale } from "next-intl/server";

export const revalidate = 60 * 60;
export const generateMetadata = async () => {
  const locale = (await getLocale()) as Locale;
  const { title, description, keywords } = await getStaticData({ locale, key: "metadata", type: "home" });
  return getMetadata({
    params: { title, description, keywords, uri: "/" },
  });
};
export default async function Home() {
  return (
    <>
      <Hero />
      <Showcase type="home" />
      <Counter type="home" />
      <Features type="home" />
      <Testimonial type="home" />
      <Carousel type="home" />
      <FAQ type="home" openOnMouseEnter={true} expandAll={true} columns={{ sm: 1, md: 2, lg: 3 }} />
      <Usage type="home" />
      <LatestPosts />
      <Pricing />
    </>
  );
}
