import { getStaticData } from "@/staticData";
import { getLocale } from "next-intl/server";
import FeaturesClient from "./client";

type FeaturesProps = {
  type: string;
  className?: string;
};

const Features = async ({ type, className }: FeaturesProps) => {
  const locale = await getLocale();
  const data = await getStaticData({ locale, key: "features", type });
  return <FeaturesClient title={data.title} description={data.description} items={data.items} className={className} />;
};

export default Features;

