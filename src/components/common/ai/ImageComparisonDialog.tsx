import ImageComparator from "@/components/common/images/comparator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface ImageComparisonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  beforeImage: {
    url: string;
    name: string;
  };
  afterImage: {
    url: string;
    name: string;
  };
  beforeLabel?: string;
  afterLabel?: string;
}

export const ImageComparisonDialog: React.FC<ImageComparisonDialogProps> = ({
  isOpen,
  onClose,
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
}) => {
  const t = useTranslations("ai.common");
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [loadedImageUrls, setLoadedImageUrls] = useState<Set<string>>(new Set());

  const finalBeforeLabel = beforeLabel || t("imageComparison.inputImage");
  const finalAfterLabel = afterLabel || t("imageComparison.generatedImage");

  useEffect(() => {
    if (isOpen) {
      const bothImagesLoaded =
        loadedImageUrls.has(beforeImage.url) && loadedImageUrls.has(afterImage.url);
      setMediaLoaded(bothImagesLoaded);
    } else {
      setLoadedImageUrls(new Set());
      setMediaLoaded(false);
    }
  }, [isOpen, beforeImage.url, afterImage.url, loadedImageUrls]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle></DialogTitle>
      <DialogContent className="h-[90vh] max-w-[90vw] overflow-hidden p-0">
        <div className="flex h-full w-full flex-col md:flex-row">
          <div className="relative flex flex-1 items-center justify-center">
            {/* Background blur effect using the "after" image */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <Image
                unoptimized
                src={afterImage.url}
                alt="background"
                fill
                sizes="100vw"
                className="scale-110 object-cover blur-2xl"
                priority
              />
            </div>

            {/* Loading skeleton */}
            {!mediaLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}

            {/* Image comparator */}
            <div className={`relative h-full w-full ${!mediaLoaded ? "invisible" : ""}`}>
              <ImageComparator
                beforeImage={beforeImage.url}
                afterImage={afterImage.url}
                beforeLabel={finalBeforeLabel}
                afterLabel={finalAfterLabel}
                className="h-full w-full"
                onImageLoad={(imageUrl) => {
                  setLoadedImageUrls((prev) => new Set([...prev, imageUrl]));
                }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-background text-foreground max-h-[90vh] w-full overflow-y-auto text-sm md:max-w-80">
            <div className="h-full space-y-4 p-4">
              <div>
                <h3 className="mb-2 font-medium">{t("imageComparison.title")}</h3>
                <p className="text-muted-foreground text-sm">{t("imageComparison.instructions")}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium">{finalBeforeLabel}</h4>
                  <p className="text-muted-foreground text-xs break-all">{beforeImage.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">{finalAfterLabel}</h4>
                  <p className="text-muted-foreground text-xs break-all">{afterImage.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
