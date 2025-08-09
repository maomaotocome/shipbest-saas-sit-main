"use client";

import { MixCarousel } from "@/components/common/mix-carousel";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface CarouselItem {
  url: string;
  type: "image" | "video";
  title?: string;
  desc?: string;
}

interface CarouselProps {
  items: CarouselItem[];
  interval?: number;
  className?: string;
}

export function Carousel({ items, interval = 3000, className }: CarouselProps) {
  const t = useTranslations("ai.common");
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl shadow-md shadow-black/15 dark:shadow-white/20",
        className
      )}
    >
      <MixCarousel
        items={items}
        interval={interval}
        className="h-full"
        title={t("demoGallery")}
        showTitle={true}
        showIndicators={true}
        autoPlay={true}
      />
    </div>
  );
}
