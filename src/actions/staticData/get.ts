"use server";
import { getStaticData } from "@/staticData";

export async function getStaticDataAction({
  locale,
  key,
  type,
}: {
  locale?: string;
  key: string;
  type: string;
}) {
  const staticData = JSON.parse(JSON.stringify(await getStaticData({ locale, key, type })));
  return staticData;
}
