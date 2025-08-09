"use client";
import { WaterfallGallery } from "@/components/common/images/waterfall-gallery";
import { SectionBackground } from "@/components/common/section-background";
import { cn } from "@/lib/utils";

interface ShowcaseData {
  title: string;
  description: string;
  images: Array<{
    id: string | number;
    src: string;
    width: number;
    height: number;
    alt?: string;
    type?: "image" | "video";
  }>;
}

interface ShowcaseClientProps {
  data: ShowcaseData;
  className?: string;
}

export const ShowcaseClient = ({ data, className }: ShowcaseClientProps) => {
  return (
    <section className={cn("w-full py-12", className)}>
      <SectionBackground />
      <div className="container mx-auto px-4">
        <h2 className="text-primary mb-8 text-center text-3xl font-bold">{data.title}</h2>
        <p className="mb-8 text-center text-gray-500">{data.description}</p>
        <WaterfallGallery
          images={data.images}
          columns={{ sm: 2, md: 4, lg: 6 }}
          gap={16}
          className="container mx-auto"
        />
      </div>
    </section>
  );
};
