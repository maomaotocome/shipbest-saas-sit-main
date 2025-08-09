import { Skeleton } from "@/components/ui/skeleton";
import { getObjectUrl } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { InfoTooltip } from "../InfoTooltip";
import { MediaItem } from "./MediaPreviewDialog";
import { AudioRenderer, ImageRenderer, VideoRenderer } from "./MediaRenderers";
import { MediaThumbnailNavigation } from "./MediaThumbnailNavigation";

interface MediaDisplayAreaProps {
  media: MediaItem;
  mediaLoaded: boolean;
  onLoad: () => void;
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
  items: MediaItem[];
  current: number;
  onSelect: (index: number) => void;
}

export const MediaDisplayArea: React.FC<MediaDisplayAreaProps> = ({
  media,
  mediaLoaded,
  onLoad,
  onTouchStart,
  onTouchEnd,
  items,
  current,
  onSelect,
}) => {
  return (
    <div
      className="relative flex h-full w-full flex-1 items-center justify-center rounded-tl-lg md:rounded-tr-none md:rounded-br-none md:rounded-bl-none rounded-tr-lg md:rounded-tl-lg"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background blur effect */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-tl-lg md:rounded-tr-none md:rounded-br-none md:rounded-bl-none rounded-tr-lg md:rounded-tl-lg">
        {media.type === "image" ? (
          <Image
            unoptimized
            src={media.url}
            alt={media.fileName ?? "background"}
            fill
            sizes="100vw"
            className="scale-110 object-cover blur-2xl"
            priority
          />
        ) : media.type === "video" ? (
          <video
            src={media.url}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full scale-110 object-cover blur-2xl"
          />
        ) : (
          media.type === "audio" && (() => {
            const coverImageUrl =
              getObjectUrl(
                media.compressedImageObjectId || media.originalImageObjectId
              ) || media.imageUrl;
            
            return coverImageUrl ? (
              <Image
                unoptimized
                src={coverImageUrl}
                alt={media.fileName ?? "audio background"}
                fill
                sizes="100vw"
                className="scale-110 object-cover blur-2xl"
                priority
              />
            ) : (
              <div className="h-full w-full scale-110 bg-gradient-to-br from-slate-800 to-slate-900 blur-2xl" />
            );
          })()
        )}
      </div>

      {/* Loading skeleton */}
      {!mediaLoaded && <Skeleton className="absolute inset-0 h-full w-full rounded-tl-lg md:rounded-tr-none md:rounded-br-none md:rounded-bl-none rounded-tr-lg md:rounded-tl-lg" />}

      {/* File name overlay */}
      {media.fileName && (
        <div className="absolute top-2 left-4 z-20 flex items-center gap-1 rounded-full bg-black/90 px-3 py-1 text-[10px] font-medium text-white md:text-sm">
          {media.fileName}
          <InfoTooltip content={media.fileName} className="h-3 w-3 text-white" />
        </div>
      )}

      {/* Media renderers */}
      {media.type === "image" ? (
        <ImageRenderer media={media} mediaLoaded={mediaLoaded} onLoad={onLoad} />
      ) : media.type === "video" ? (
        <VideoRenderer media={media} mediaLoaded={mediaLoaded} onLoad={onLoad} />
      ) : (
        media.type === "audio" && (
          <AudioRenderer media={media} mediaLoaded={mediaLoaded} onLoad={onLoad} />
        )
      )}

      <MediaThumbnailNavigation items={items} current={current} onSelect={onSelect} />
    </div>
  );
};
