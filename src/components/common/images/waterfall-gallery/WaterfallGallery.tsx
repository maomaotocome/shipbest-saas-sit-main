"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PlayIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { SectionBackground } from "../../section-background";

interface MediaItem {
  id: string | number;
  src: string;
  width: number;
  height: number;
  alt?: string;
  buttonText?: string;
  viewUrl?: string;
  type?: "image" | "video";
}

interface WaterfallGalleryProps {
  images: MediaItem[];
  columns?: {
    sm?: 1 | 2;
    md?: 2 | 3 | 4;
    lg?: 4 | 5 | 6;
  };
  gap?: number;
  className?: string;
  onClick?: (id: string | number) => void;
  buttonText?: string;
}

const MediaColumn: React.FC<{
  images: MediaItem[];
  gap: number;
  onClick?: (id: string | number) => void;
}> = ({ images, gap, onClick }) => {
  return (
    <div className="flex flex-1 flex-col" style={{ gap }}>
      {images.map((image) => (
        <div
          key={image.id}
          className="group/item relative w-full cursor-pointer overflow-hidden rounded-lg"
          style={{
            paddingBottom: `${(image.height / image.width) * 100}%`,
            width: "100%",
          }}
          onClick={() => onClick?.(image.id)}
        >
          <Suspense fallback={<Skeleton className="absolute inset-0 h-full w-full" />}>
            {image.type === "video" ? (
              <video
                src={image.src}
                width={image.width}
                height={image.height}
                className="absolute inset-0 h-full w-full object-cover transition-transform hover:scale-105"
                muted
                loop
                playsInline
                preload="metadata"
                onMouseEnter={(e) => {
                  const video = e.target as HTMLVideoElement;
                  video.play().catch(() => {
                    // Ignore autoplay errors
                  });
                }}
                onMouseLeave={(e) => {
                  const video = e.target as HTMLVideoElement;
                  video.pause();
                  video.currentTime = 0;
                }}
              />
            ) : (
              <Image
                src={image.src}
                alt={image.alt || ""}
                width={image.width}
                height={image.height}
                className="absolute inset-0 h-full w-full object-cover transition-transform hover:scale-105"
              />
            )}

            {/* Video play indicator */}
            {image.type === "video" && (
              <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white">
                <PlayIcon className="h-3 w-3" />
              </div>
            )}
          </Suspense>
        </div>
      ))}
    </div>
  );
};

// For backward compatibility
export type ImageItem = MediaItem;

export const WaterfallGallery: React.FC<WaterfallGalleryProps> = ({
  images,
  columns = { sm: 2, md: 3, lg: 5 },
  gap = 16,
  className,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnImages, setColumnImages] = useState<MediaItem[][]>([]);
  const [currentColumns, setCurrentColumns] = useState<number>(5);

  useEffect(() => {
    const updateColumns = () => {
      if (typeof window === "undefined") return;

      const width = window.innerWidth;
      let cols = 5; // default

      if (width < 640) {
        cols = columns.sm || 2;
      } else if (width < 1024) {
        cols = columns.md || 3;
      } else {
        cols = columns.lg || 5;
      }

      setCurrentColumns(cols);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [columns]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize columns
    const newColumnImages: MediaItem[][] = Array.from({ length: currentColumns }, () => []);
    const newColumnHeights: number[] = Array(currentColumns).fill(0);

    // Distribute images to columns
    images.forEach((image) => {
      const shortestColumnIndex = newColumnHeights.indexOf(Math.min(...newColumnHeights));
      newColumnImages[shortestColumnIndex].push(image);
      newColumnHeights[shortestColumnIndex] += (image.height / image.width) * 100;
    });

    setColumnImages(newColumnImages);
  }, [images, currentColumns]);

  return (
    <div ref={containerRef} className={cn("flex w-full", className)} style={{ gap }}>
      <SectionBackground />
      {columnImages.map((column, columnIndex) => (
        <MediaColumn key={columnIndex} images={column} gap={gap} onClick={onClick} />
      ))}
    </div>
  );
};
