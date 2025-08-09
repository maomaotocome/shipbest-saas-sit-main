import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useEffect, useRef, useState } from "react";
import { MediaDisplayArea } from "./MediaDisplayArea";

export type MediaItem = {
  type: "image" | "video" | "audio";
  url: string;
  fileName?: string;
  imageUrl?: string;
  originalImageObjectId?: string;
  compressedImageObjectId?: string;
};

interface MediaPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: MediaItem[];
  initialIndex?: number;
  sidebar: React.ReactNode | React.ReactNode[];
}

export const MediaPreviewDialog: React.FC<MediaPreviewDialogProps> = ({
  isOpen,
  onClose,
  items,
  initialIndex = 0,
  sidebar,
}) => {
  const [current, setCurrent] = useState(initialIndex);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [loadedMediaUrls, setLoadedMediaUrls] = useState<Set<string>>(new Set());

  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrent(initialIndex);
    } else {
      // Clear cache when dialog closes
      setLoadedMediaUrls(new Set());
      setMediaLoaded(false);
    }
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || items.length <= 1) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrent((prev) => (prev === 0 ? items.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrent((prev) => (prev === items.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, items.length]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const threshold = 50; // Swipe threshold
    if (deltaX > threshold) {
      // swipe right -> prev
      setCurrent((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    } else if (deltaX < -threshold) {
      // swipe left -> next
      setCurrent((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    }
    touchStartX.current = null;
  };

  const media = items[current];

  useEffect(() => {
    const mediaUrl = media?.url;
    if (mediaUrl) {
      if (loadedMediaUrls.has(mediaUrl)) {
        setMediaLoaded(true);
      } else {
        setMediaLoaded(false);
      }
    }
  }, [media?.url, media?.type, loadedMediaUrls]);
  if (!media) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle></DialogTitle>
      <DialogContent className="h-[90vh] max-w-[90vw] overflow-hidden p-0">
        <div className="flex h-full w-full flex-col md:flex-row">
          <div className="relative flex flex-1 items-center justify-center">
            <MediaDisplayArea
              media={media}
              mediaLoaded={mediaLoaded}
              onLoad={() => {
                setMediaLoaded(true);
                setLoadedMediaUrls((prev) => new Set([...prev, media.url]));
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              items={items}
              current={current}
              onSelect={setCurrent}
            />
          </div>

          <div className="bg-background text-foreground max-h-[90vh] w-full overflow-y-auto text-sm md:max-w-160">
            <ScrollArea className="h-full p-4">
              {Array.isArray(sidebar) ? sidebar[current] : sidebar}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
