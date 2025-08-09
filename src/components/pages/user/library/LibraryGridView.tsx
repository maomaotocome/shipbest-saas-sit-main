"use client";

import { MediaItem } from "@/components/common/ai/MediaPreview/MediaPreviewDialog";
import { useMediaPreview } from "@/components/common/ai/MediaPreview/MediaPreviewProvider";
import { LibraryObject } from "@/db/library";
import { MediaType } from "@/lib/types/media-metadata";
import Image from "next/image";
import { LibraryObjectActions } from "./LibraryObjectActions";
import { LibraryObjectInfo } from "./LibraryObjectInfo";

interface LibraryGridViewProps {
  objects: LibraryObject[];
}

export function LibraryGridView({ objects }: LibraryGridViewProps) {
  const { openPreview } = useMediaPreview();

  const handleObjectClick = (object: LibraryObject) => {
    const mediaObjects = objects.filter(
      (obj) => obj.mediaType === MediaType.IMAGE || obj.mediaType === MediaType.VIDEO
    );

    const mediaItems: MediaItem[] = mediaObjects.map((obj) => ({
      type: obj.mediaType === MediaType.VIDEO ? "video" : "image",
      url: obj.publicUrl || `/api/oss/object/${obj.id}`,
      fileName: obj.originName,
    }));

    const mediaIndex = mediaObjects.findIndex((obj) => obj.id === object.id);

    if (mediaIndex >= 0) {
      const sidebarContent = mediaObjects.map((obj, idx) => (
        <LibraryObjectInfo key={`${obj.id}-${idx}`} object={obj} />
      ));

      openPreview(mediaItems, mediaIndex, sidebarContent);
    }
  };

  const renderThumbnail = (object: LibraryObject) => {
    if (object.mediaType === MediaType.IMAGE) {
      return (
        <Image
          src={object.publicUrl || `/api/oss/object/${object.id}`}
          alt={object.originName}
          fill
          className="object-cover"
          loading="lazy"
          unoptimized
        />
      );
    } else if (object.mediaType === MediaType.VIDEO) {
      return (
        <video
          src={object.publicUrl || `/api/oss/object/${object.id}`}
          className="h-full w-full object-cover"
          muted
          loop
          onMouseEnter={(e) => {
            const video = e.target as HTMLVideoElement;
            video.play().catch(() => {});
          }}
          onMouseLeave={(e) => {
            const video = e.target as HTMLVideoElement;
            video.pause();
            video.currentTime = 0;
          }}
        />
      );
    } else if (object.mediaType === MediaType.AUDIO) {
      return (
        <div className="bg-muted flex h-full flex-col items-center justify-center">
          <svg
            className="text-muted-foreground mb-2 h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <span className="text-muted-foreground px-2 text-center text-xs">
            {object.originName}
          </span>
        </div>
      );
    } else if (object.mediaType === MediaType.DOCUMENT) {
      return (
        <div className="bg-muted flex h-full flex-col items-center justify-center">
          <svg
            className="text-muted-foreground mb-2 h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-muted-foreground px-2 text-center text-xs">
            {object.originName}
          </span>
        </div>
      );
    } else {
      return (
        <div className="bg-muted flex h-full flex-col items-center justify-center">
          <svg
            className="text-muted-foreground mb-2 h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span className="text-muted-foreground px-2 text-center text-xs">
            {object.originName}
          </span>
        </div>
      );
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {objects.map((object, index) => (
        <div
          key={`${object.id}-${index}`}
          className="group border-border hover:border-border/80 relative aspect-square cursor-pointer overflow-hidden rounded-lg border transition-colors"
          onClick={() => handleObjectClick(object)}
        >
          <div className="relative h-full w-full">{renderThumbnail(object)}</div>

          {/* Overlay with file info */}
          <div className="absolute inset-0 flex flex-col justify-between bg-black/60 p-3 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex items-start justify-between">
              <div className="text-xs text-white">
                <div className="mb-1 truncate font-medium">{object.originName}</div>
                <div className="text-white/70">
                  {(object.size / 1024 / 1024).toFixed(2)} MB ({object.size} bytes)
                </div>
              </div>
              <LibraryObjectActions object={object} />
            </div>

            <div className="text-xs text-white/70">
              <div>{new Date(object.createdAt).toLocaleDateString()}</div>
              {object.taskInfo && (
                <div className="mt-1 rounded bg-blue-500/20 px-2 py-1 text-center text-blue-200">
                  AI Generated
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
