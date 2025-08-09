"use client";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExploreGallery } from "./ExploreGallery";
import { ExploreHeader } from "./ExploreHeader";
import { FilterBar } from "./FilterBar";
import { useExplore } from "./use-explore";

export default function ExploreClient() {
  const [type, setType] = useState("all");
  const [featured, setFeatured] = useState<boolean | undefined>(undefined);
  const [orderBy, setOrderBy] = useState<"createdAt" | "featured">("createdAt");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const locale = useLocale();

  const {
    data: items = [],
    isLoading,
    error,
  } = useExplore({
    type,
    featured,
    page,
    pageSize: 500,
    orderBy,
  });

  const handleReset = () => {
    setType("all");
    setFeatured(undefined);
    setOrderBy("createdAt");
    setPage(1);
  };

  const handleItemClick = (itemId: string | number) => {
    router.push(`/${locale}/explore/item/${itemId}`);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto pt-40 pb-8">
      <ExploreHeader />

      <div className="mb-8">
        <FilterBar
          type={type}
          onTypeChange={setType}
          featured={featured}
          onFeaturedChange={setFeatured}
          orderBy={orderBy}
          onOrderByChange={setOrderBy}
          onReset={handleReset}
        />
      </div>

      <div className="mb-8">
        <ExploreGallery
          items={items}
          isLoading={isLoading}
          error={error}
          onItemClick={handleItemClick}
          onReset={handleReset}
          onLoadMore={handleLoadMore}
          showLoadMore={items.length >= 20 && !isLoading}
        />
      </div>
    </div>
  );
}
