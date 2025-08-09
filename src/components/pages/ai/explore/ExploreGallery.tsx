import { WaterfallGallery } from "@/components/common/images/waterfall-gallery";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExploreItem } from "@/db/generated/prisma";
import { useLocale, useTranslations } from "next-intl";
import { transformToGalleryImages } from "./utils";

interface ExploreGalleryProps {
  items: ExploreItem[];
  isLoading: boolean;
  error: Error | null;
  onItemClick: (itemId: string | number) => void;
  onReset: () => void;
  onLoadMore: () => void;
  showLoadMore: boolean;
}

export function ExploreGallery({
  items,
  isLoading,
  error,
  onItemClick,
  onReset,
  onLoadMore,
  showLoadMore,
}: ExploreGalleryProps) {
  const t = useTranslations("explore");
  const locale = useLocale();

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-destructive">{t("gallery.error")}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <h3 className="mb-2 text-lg font-semibold">{t("gallery.noItems")}</h3>
          <p className="text-muted-foreground text-center">{t("gallery.noItemsDescription")}</p>
          <Button onClick={onReset} variant="outline" className="mt-4">
            {t("filters.reset")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const galleryImages = transformToGalleryImages(items, t, locale);

  return (
    <div className="space-y-8">
      <WaterfallGallery
        images={galleryImages}
        onClick={onItemClick}
        columns={{ sm: 2, md: 3, lg: 5 }}
        className="min-h-[400px]"
      />

      {showLoadMore && (
        <div className="flex justify-center">
          <Button onClick={onLoadMore} variant="outline" size="lg">
            {t("gallery.loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
