import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useEffect, useRef } from "react";
import { MediaItem } from "./MediaPreviewDialog";
import { AudioThumbnail } from "./MediaRenderers/audio/AudioThumbnail";
import { ImageThumbnail } from "./MediaRenderers/image/ImageThumbnail";
import { VideoThumbnail } from "./MediaRenderers/video/VideoThumbnail";

interface MediaThumbnailNavigationProps {
  items: MediaItem[];
  current: number;
  onSelect: (index: number) => void;
}

export const MediaThumbnailNavigation: React.FC<MediaThumbnailNavigationProps> = ({
  items,
  current,
  onSelect,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const currentItemRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current item with centering logic
  useEffect(() => {
    if (scrollAreaRef.current && currentItemRef.current) {
      // Find the actual scrollable container inside ScrollArea
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement;

      if (!scrollContainer) return;

      const currentItem = currentItemRef.current;

      const containerWidth = scrollContainer.offsetWidth;
      const containerScrollWidth = scrollContainer.scrollWidth;
      const itemOffsetLeft = currentItem.offsetLeft;
      const itemWidth = currentItem.offsetWidth;

      // Calculate the ideal scroll position to center the current item
      const idealScrollLeft = itemOffsetLeft - containerWidth / 2 + itemWidth / 2;

      // Calculate the maximum possible scroll position
      const maxScrollLeft = containerScrollWidth - containerWidth;

      // Determine the actual scroll position:
      // - If ideal position is negative, scroll to the beginning (0)
      // - If ideal position exceeds max, scroll to the end (maxScrollLeft)
      // - Otherwise, use the ideal centered position
      let targetScrollLeft;

      if (idealScrollLeft <= 0) {
        targetScrollLeft = 0;
      } else if (idealScrollLeft >= maxScrollLeft) {
        targetScrollLeft = maxScrollLeft;
      } else {
        targetScrollLeft = idealScrollLeft;
      }

      // Only scroll if the target position is different from current position
      if (Math.abs(scrollContainer.scrollLeft - targetScrollLeft) > 1) {
        scrollContainer.scrollTo({
          left: targetScrollLeft,
          behavior: "smooth",
        });
      }
    }
  }, [current]);

  if (items.length <= 1) return null;

  return (
    <div className="pointer-events-auto absolute right-4 bottom-4 left-4 z-10 hidden justify-center md:flex">
      <div className="max-w-full rounded-lg bg-black/60 px-1 py-1">
        <ScrollArea ref={scrollAreaRef} className="max-w-full">
          <div className="flex gap-2 px-1 py-1">
            {items.map((item, idx) => {
              const isSelected = idx === current;
              const handleClick = () => onSelect(idx);

              if (item.type === "image") {
                return (
                  <div ref={isSelected ? currentItemRef : undefined} key={idx}>
                    <ImageThumbnail item={item} isSelected={isSelected} onClick={handleClick} />
                  </div>
                );
              } else if (item.type === "video") {
                return (
                  <div ref={isSelected ? currentItemRef : undefined} key={idx}>
                    <VideoThumbnail item={item} isSelected={isSelected} onClick={handleClick} />
                  </div>
                );
              } else if (item.type === "audio") {
                return (
                  <div ref={isSelected ? currentItemRef : undefined} key={idx}>
                    <AudioThumbnail item={item} isSelected={isSelected} onClick={handleClick} />
                  </div>
                );
              }

              return null;
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
