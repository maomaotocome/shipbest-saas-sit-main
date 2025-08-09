"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
export interface CarouselItem {
  url: string;
  type: "image" | "video";
  title?: string;
  desc?: string;
}

interface MixCarouselProps {
  items: CarouselItem[];
  interval?: number;
  className?: string;
  title?: string;
  showTitle?: boolean;
  showIndicators?: boolean;
  autoPlay?: boolean;
}

export function MixCarousel({
  items,
  interval = 3000,
  className,
  title,
  showTitle = false,
  showIndicators = true,
  autoPlay = true,
}: MixCarouselProps) {
  const t = useTranslations("common.errors");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const videoRefs = useRef<Record<number, HTMLVideoElement>>({});

  const goToNextItem = useCallback(() => {
    if (!items || items.length <= 1) return;

    // begin transition
    setIsTransitioning(true);

    // switch to next item after a short delay
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
      setIsTransitioning(false);
    }, 300);
  }, [items]);

  // handle timer
  useEffect(() => {
    if (!autoPlay || !items || items.length <= 1) return;

    const startTimer = () => {
      // clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // if current item is image, set timer
      if (items[currentIndex].type === "image") {
        timerRef.current = setTimeout(goToNextItem, interval);
      }
    };

    startTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, interval, items, autoPlay, goToNextItem]);

  // handle video playback
  useEffect(() => {
    if (!autoPlay || !items || items.length <= 1) return;

    const currentItem = items[currentIndex];
    if (currentItem.type === "video") {
      const video = videoRefs.current[currentIndex];
      if (video) {
        video.currentTime = 0;
        video.play().catch((error) => {
          console.error(t("videoPlaybackFailed"), error);
          goToNextItem();
        });
      }
    }
  }, [currentIndex, items, autoPlay, goToNextItem, t]);

  if (!items || !items.length) return null;

  return (
    <div className={cn("bg-muted relative flex h-full flex-col overflow-hidden", className)}>
      {showTitle && (
        <div className="absolute top-0 right-0 left-0 z-10 flex items-center gap-1.5 bg-gradient-to-b from-black/50 to-transparent p-2">
          <Play className="h-4 w-4 text-white" />
          <Label className="block text-left text-sm text-white">{title || ""}</Label>
        </div>
      )}

      <div className="relative flex-1">
        {items.map((item, index) => (
          <div
            key={item.url}
            className={cn(
              "absolute inset-0 transition-opacity duration-300",
              index === currentIndex ? "opacity-100" : "opacity-0",
              isTransitioning ? "pointer-events-none" : ""
            )}
          >
            <div className="relative h-full w-full">
              {item.type === "image" ? (
                <Image
                  unoptimized
                  src={item.url}
                  alt={item.title || ""}
                  className="h-full w-full object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={() => {
                    console.error(t("imageLoadFailed"), item.url);
                    goToNextItem();
                  }}
                />
              ) : (
                <video
                  ref={(el) => {
                    if (el) {
                      videoRefs.current[index] = el;
                    } else {
                      delete videoRefs.current[index];
                    }
                  }}
                  src={item.url}
                  className="h-full w-full object-cover"
                  controls={false}
                  autoPlay={index === currentIndex}
                  muted
                  loop={!autoPlay}
                  playsInline
                  disablePictureInPicture
                  controlsList="noplaybackrate nofullscreen nodownload"
                  onEnded={autoPlay ? goToNextItem : undefined}
                  onError={() => {
                    console.error(t("videoLoadFailed"), item.url);
                    goToNextItem();
                  }}
                />
              )}
              {(item.title || item.desc) && (
                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent px-4 pt-4 pb-8 text-white">
                  {item.title && <h3 className="text-lg font-bold">{item.title}</h3>}
                  {item.desc && <p className="text-sm">{item.desc}</p>}
                </div>
              )}
            </div>
          </div>
        ))}
        {showIndicators && items.length > 1 && (
          <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentIndex ? "w-4 bg-white" : "bg-white/50 hover:bg-white/75"
                )}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
