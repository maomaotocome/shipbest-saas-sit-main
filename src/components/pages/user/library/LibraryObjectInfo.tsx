"use client";

import { Badge } from "@/components/ui/badge";
import { LibraryObject } from "@/db/library";
import { MediaType } from "@/lib/types/media-metadata";
import { StorageObjectSource } from "@/lib/constants";
import { useTranslations } from "next-intl";
import { CalendarDays, FileText, HardDrive, Layers, Monitor, Tag } from "lucide-react";

interface LibraryObjectInfoProps {
  object: LibraryObject;
}

export function LibraryObjectInfo({ object }: LibraryObjectInfoProps) {
  const t = useTranslations();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const getMediaTypeBadge = (mediaType: MediaType) => {
    const variants: Record<MediaType, "default" | "secondary" | "outline"> = {
      [MediaType.IMAGE]: "default",
      [MediaType.VIDEO]: "secondary",
      [MediaType.AUDIO]: "outline",
      [MediaType.DOCUMENT]: "outline",
      [MediaType.OTHER]: "outline"
    };

    return (
      <Badge variant={variants[mediaType]}>
        {mediaType.toUpperCase()}
      </Badge>
    );
  };

  const getSourceBadge = (source: StorageObjectSource) => {
    return (
      <Badge variant={source === StorageObjectSource.USER_GENERATED ? "default" : "secondary"}>
        {source === StorageObjectSource.USER_GENERATED 
          ? t("user.library.generated")
          : t("user.library.uploaded")
        }
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* File Name */}
      <div>
        <h3 className="text-lg font-semibold mb-2">{object.originName}</h3>
        <div className="flex flex-wrap gap-2">
          {getMediaTypeBadge(object.mediaType)}
          {getSourceBadge(object.source)}
          {object.taskInfo && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {t("user.library.ai_generated")}
            </Badge>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <HardDrive className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{t("user.library.file_size")}:</span>
          <span className="font-medium">{formatFileSize(object.size)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{t("user.library.file_type")}:</span>
          <span className="font-medium">{object.type}</span>
        </div>

        {object.extension && (
          <div className="flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t("user.library.extension")}:</span>
            <span className="font-medium">{object.extension}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{t("user.library.created_at")}:</span>
          <span className="font-medium">{new Date(object.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Dimensions */}
      {object.dimensions && (
        <div className="space-y-3">
          <h4 className="font-medium">{t("user.library.dimensions")}</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t("user.library.resolution")}:</span>
              <span className="font-medium">
                {object.dimensions.width} × {object.dimensions.height}
              </span>
            </div>
            
            {object.ratio && (
              <div className="flex items-center gap-2 text-sm">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t("user.library.aspect_ratio")}:</span>
                <span className="font-medium">
                  {object.ratio.w}:{object.ratio.h}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Info */}
      {object.taskInfo && (
        <div className="space-y-3">
          <h4 className="font-medium">{t("user.library.task_info")}</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">{t("user.library.task_id")}:</span>
              <span className="font-mono text-xs ml-2 bg-muted px-2 py-1 rounded">
                {object.taskInfo.taskId}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">{t("user.library.subtask_id")}:</span>
              <span className="font-mono text-xs ml-2 bg-muted px-2 py-1 rounded">
                {object.taskInfo.subTaskId}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Processing Info */}
      {(object.isOriginal !== undefined || object.isProcessed !== undefined) && (
        <div className="space-y-3">
          <h4 className="font-medium">{t("user.library.processing_info")}</h4>
          <div className="space-y-2 text-sm">
            {object.isOriginal !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t("user.library.is_original")}:</span>
                <Badge variant={object.isOriginal ? "default" : "secondary"}>
                  {object.isOriginal ? t("user.library.yes") : t("user.library.no")}
                </Badge>
              </div>
            )}
            
            {object.isProcessed !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t("user.library.is_processed")}:</span>
                <Badge variant={object.isProcessed ? "default" : "secondary"}>
                  {object.isProcessed ? t("user.library.yes") : t("user.library.no")}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Path */}
      <div className="space-y-3">
        <h4 className="font-medium">{t("user.library.storage_info")}</h4>
        <div className="text-sm">
          <span className="text-muted-foreground">{t("user.library.file_path")}:</span>
          <div className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
            {object.key}
          </div>
        </div>
      </div>
    </div>
  );
}