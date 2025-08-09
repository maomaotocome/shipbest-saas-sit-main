import { MediaItem } from "@/components/common/ai/MediaPreview/MediaPreviewDialog";
import { PreviewParameterDisplay } from "@/components/common/ai/PreviewParameterDisplay";
import { SubTask } from "@/db/generated/prisma";
import { Locale } from "@/i18n/locales";
import { TaskType } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { TaskListItem } from "@/types/tasks";
import { useTranslations } from "next-intl";
import React from "react";
import { MediaFileInfo } from "../components/MediaFileInfo";
import { MediaPreviewHeader } from "../components/MediaPreviewHeader";

interface MediaPreviewConfig {
  mediaItems: MediaItem[];
  sidebarItems: React.ReactNode[];
}

interface MediaItemData {
  type: "image" | "video" | "audio";
  url: string;
  fileName: string;
  width?: number;
  height?: number;
  fileSize?: number;
  imageUrl?: string;
  originalImageObjectId?: string;
  compressedImageObjectId?: string;
}

export function useMediaPreviewAtTaskList(
  task: TaskListItem,
  locale: Locale
): {
  createPreviewConfig: (
    subTask: SubTask,
    subRequest: Record<string, unknown>,
    mediaItems: MediaItemData[]
  ) => MediaPreviewConfig;
} {
  const tTask = useTranslations("task");

  const createPreviewConfig = (
    subTask: SubTask,
    subRequest: Record<string, unknown>,
    mediaItems: MediaItemData[]
  ): MediaPreviewConfig => {
    const config: MediaPreviewConfig = {
      mediaItems: [],
      sidebarItems: [],
    };

    mediaItems.forEach((mediaItem, index) => {
      // Add to media items
      config.mediaItems.push({
        type: mediaItem.type,
        url: mediaItem.url,
        fileName: mediaItem.fileName,
        imageUrl: mediaItem.imageUrl,
        originalImageObjectId: mediaItem.originalImageObjectId,
        compressedImageObjectId: mediaItem.compressedImageObjectId,
      });

      // Create header content
      const headerContent = <MediaPreviewHeader task={task} subTask={subTask} locale={locale} />;

      // Create footer content
      const footerContent = (
        <div>
          <h3 className="text-foreground mb-3 font-medium">{tTask("preview.fileInformation")}</h3>
          <MediaFileInfo
            width={mediaItem.width}
            height={mediaItem.height}
            fileSize={mediaItem.fileSize}
          />
        </div>
      );

      // Convert mediaItems to taskMedia format for comparison
      const taskMedia = mediaItems.map((item) => ({
        url: item.url,
        name: item.fileName,
      }));

      // Add sidebar item
      config.sidebarItems.push(
        <PreviewParameterDisplay
          key={`${subTask.id}-${index}-sidebar`}
          header={headerContent}
          footer={footerContent}
          taskType={task.taskType as TaskType}
          metadata={task.metadata as JsonObject}
          request={subRequest}
          taskMedia={taskMedia}
        />
      );
    });

    return config;
  };

  return { createPreviewConfig };
}
