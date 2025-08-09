"use client";

import { MediaItem } from "@/components/common/ai/MediaPreview/MediaPreviewDialog";
import { useMediaPreview } from "@/components/common/ai/MediaPreview/MediaPreviewProvider";
import { Badge } from "@/components/ui/badge";
import { LibraryObject } from "@/db/library";
import { StorageObjectSource } from "@/lib/constants";
import { MediaType } from "@/lib/types/media-metadata";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { LibraryObjectActions } from "./LibraryObjectActions";
import { LibraryObjectInfo } from "./LibraryObjectInfo";

interface LibraryListViewProps {
  objects: LibraryObject[];
}

export function LibraryListView({ objects }: LibraryListViewProps) {
  const t = useTranslations();
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
      const sidebarContent = mediaObjects.map((obj) => (
        <LibraryObjectInfo key={obj.id} object={obj} />
      ));

      openPreview(mediaItems, mediaIndex, sidebarContent);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const getMediaTypeIcon = (mediaType: MediaType) => {
    switch (mediaType) {
      case MediaType.IMAGE:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case MediaType.VIDEO:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        );
      case MediaType.AUDIO:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        );
      case MediaType.DOCUMENT:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
    }
  };

  const renderThumbnail = (object: LibraryObject) => {
    if (object.mediaType === MediaType.IMAGE) {
      return (
        <Image
          src={object.publicUrl || `/api/oss/object/${object.id}`}
          alt={object.originName}
          width={64}
          height={64}
          className="rounded-md object-cover"
          loading="lazy"
          unoptimized
        />
      );
    } else if (object.mediaType === MediaType.VIDEO) {
      return (
        <video
          src={object.publicUrl || `/api/oss/object/${object.id}`}
          className="h-16 w-16 rounded-md object-cover"
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
    } else {
      return (
        <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-md">
          {getMediaTypeIcon(object.mediaType)}
        </div>
      );
    }
  };

  return (
    <div className="space-y-2">
      {objects.map((object) => (
        <div
          key={object.id}
          className="group border-border hover:border-border/80 hover:bg-muted/50 flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors"
          onClick={() => handleObjectClick(object)}
        >
          {/* Thumbnail */}
          <div className="flex-shrink-0">{renderThumbnail(object)}</div>

          {/* File Info */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="truncate font-medium">{object.originName}</h3>
              {object.taskInfo && (
                <Badge variant="secondary" className="text-xs">
                  {t("user.library.ai_generated")}
                </Badge>
              )}
            </div>

            <div className="text-muted-foreground flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                {getMediaTypeIcon(object.mediaType)}
                {object.mediaType.toUpperCase()}
              </span>

              <span>{formatFileSize(object.size)}</span>

              <span>
                {object.source === StorageObjectSource.USER_UPLOAD
                  ? t("user.library.uploaded")
                  : t("user.library.generated")}
              </span>

              <span>{new Date(object.createdAt).toLocaleDateString()}</span>

              {object.dimensions && (
                <span>
                  {object.dimensions.width} × {object.dimensions.height}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
            <LibraryObjectActions object={object} />
          </div>
        </div>
      ))}
    </div>
  );
}
