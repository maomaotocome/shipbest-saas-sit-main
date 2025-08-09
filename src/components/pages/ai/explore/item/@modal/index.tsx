import { getExploreItemById } from "@/db/explore";
import { notFound } from "next/navigation";
import { ExploreItem } from "../../types";
import { ExploreModalWrapper } from "./ExploreModalWrapper";

interface ExploreItemModalPageProps {
  params: Promise<{
    itemId: string;
    locale: string;
  }>;
}

export default async function ExploreItemModalPage({ params }: ExploreItemModalPageProps) {
  const { itemId } = await params;

  const item = await getExploreItemById(itemId);

  if (!item) {
    notFound();
  }

  return <ExploreModalWrapper item={item as ExploreItem} />;
}
