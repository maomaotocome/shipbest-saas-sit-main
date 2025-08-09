import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface ImagePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  fileName: string;
}

export const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  isOpen,
  onClose,
  imageUrl,
  fileName,
}) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      const maxWidth = window.innerWidth * 0.9;
      const maxHeight = window.innerHeight * 0.9;
      const aspectRatio = imageSize.width / imageSize.height;

      let width = maxWidth;
      let height = width / aspectRatio;

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      setContainerSize({ width: Math.round(width), height: Math.round(height) });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [imageSize]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    setImageSize({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    setImageLoaded(true);
  };

  useEffect(() => {
    setImageLoaded(false);
  }, [imageUrl]);

  if (containerSize.width === 0 || containerSize.height === 0) {
    return null;
  }

  if (!imageUrl) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="overflow-hidden p-0"
        style={{
          width: containerSize.width > 0 ? `${containerSize.width}px` : "auto",
          height: containerSize.height > 0 ? `${containerSize.height}px` : "auto",
          maxWidth: "90vw",
          maxHeight: "90vh",
        }}
      >
        <div
          className="relative"
          style={{
            width: containerSize.width > 0 ? `${containerSize.width}px` : "100%",
            height: containerSize.height > 0 ? `${containerSize.height}px` : "100%",
          }}
        >
          <DialogTitle className="absolute top-2 left-4 z-20 rounded-full bg-black/90 px-4 py-2 text-[10px] font-medium text-white md:text-sm">
            {fileName}
          </DialogTitle>

          {/* Image container */}
          <div className="relative h-full w-full">
            {!imageLoaded && <Skeleton className="absolute inset-0 z-10 h-full w-full" />}
            {imageUrl && (
              <Image
                unoptimized
                src={imageUrl}
                alt={fileName}
                onLoad={handleImageLoad}
                className={`h-full w-full ${!imageLoaded ? "invisible" : ""}`}
                fill
                sizes="90vw"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
