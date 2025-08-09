import { getStaticData } from "@/staticData";
import { getLocale } from "next-intl/server";
import TestimonialClient from "./client";

type TestimonialProps = {
  type: string;
  className?: string;
};

const Testimonial = async ({ type, className }: TestimonialProps) => {
  const locale = await getLocale();
  const data = await getStaticData({ locale, key: "testimonial", type });
  return <TestimonialClient title={data.title} description={data.description} items={data.items} className={className} />;
};

export default Testimonial;
