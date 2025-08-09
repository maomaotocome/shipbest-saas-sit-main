import { getMetadata } from "@/lib/metadata";
import { getStaticData } from "@/staticData";
import { getLocale } from "next-intl/server";
import ExploreClient from "./client";

//cache time 1 hour
export const revalidate = 3600;

export default function Explore() {
  return <ExploreClient />;
}

export async function generateMetadata() {
  const locale = await getLocale();
  const { title, description, keywords } = await getStaticData({
    locale,
    key: "metadata",
    type: "explore",
  });
  return getMetadata({
    params: {
      title: `${title} `,
      description: description,
      keywords: keywords,
      uri: "/explore",
      noIndex: true,
    },
  });
}
