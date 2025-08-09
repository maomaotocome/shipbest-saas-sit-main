import { getStaticData } from "@/staticData";
import { getLocale } from "next-intl/server";
import UsageClient from "./client";

type UsageProps = {
  type: string;
  className?: string;
};

const Usage = async ({ type, className }: UsageProps) => {
  const locale = await getLocale();
  const data = await getStaticData({ locale, key: "usage", type });

  return <UsageClient {...data} className={className} />;
};

export default Usage;
