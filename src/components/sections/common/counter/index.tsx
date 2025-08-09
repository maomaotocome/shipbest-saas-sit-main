import { getStaticData } from "@/staticData";
import { getLocale } from "next-intl/server";
import CounterClient from "./client";
// props
type CounterProps = {
  type: string;
  className?: string;
};

const Counter = async ({ type, className }: CounterProps) => {
  const locale = await getLocale();
  const data = await getStaticData({ locale, key: "counter", type });
  return <CounterClient title={data.title} description={data.description} items={data.items} className={className} />;
};

export default Counter;
