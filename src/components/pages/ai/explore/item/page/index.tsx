import { getExploreItemById } from "@/db/explore";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExploreItem } from "../../types";
import { ExploreItemDetail } from "./ExploreItemDetail";

export const revalidate = 3600;

interface ExploreItemPageProps {
  params: Promise<{
    itemId: string;
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ExploreItemPageProps): Promise<Metadata> {
  const { itemId } = await params;

  const item = await getExploreItemById(itemId);

  if (!item) {
    return {
      title: "Item not found",
    };
  }

  return {
    title: `${item.taskType} - Explore`,
    description: `View this ${item.type} created with ${item.taskType}`,
  };
}

export default async function ExploreItemPage({ params }: ExploreItemPageProps) {
  const { itemId } = await params;

  const item = await getExploreItemById(itemId);

  if (!item) {
    notFound();
  }

  return <ExploreItemDetail item={item as ExploreItem} />;
}
