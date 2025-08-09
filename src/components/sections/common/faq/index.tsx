import { getStaticData } from "@/staticData";
import { getLocale } from "next-intl/server";
import FAQClient from "./client";

type FAQProps = {
  type: string;
  openOnMouseEnter?: boolean;
  expandAll?: boolean;
  columns?: {
    sm: 1 | 2;
    md: 1 | 2 | 3;
    lg: 1 | 2 | 3 | 4;
  };
  className?: string;
};

const FAQ = async ({ type, openOnMouseEnter = true, expandAll = false, columns, className }: FAQProps) => {
  const locale = await getLocale();
  const data = await getStaticData({ locale, key: "faq", type });
  return (
    <FAQClient
      title={data.title}
      description={data.description}
      items={data.items}
      openOnMouseEnter={openOnMouseEnter}
      expandAll={expandAll}
      columns={columns}
      className={className}
    />
  );
};

export default FAQ;
