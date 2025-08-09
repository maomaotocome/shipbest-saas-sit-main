import { useTaskInvokerConfig } from "@/components/common/ai/DynamicParameterDisplay";
import { MediaItem } from "@/components/common/ai/MediaPreview/MediaPreviewDialog";
import { useMediaPreview } from "@/components/common/ai/MediaPreview/MediaPreviewProvider";
import { useRecreateTask } from "@/components/common/ai/RecreateTaskProvider";
import { TaskStatus } from "@/db/generated/prisma";
import { Locale } from "@/i18n/locales";
import { TaskType } from "@/lib/constants";
import { getObjectUrl } from "@/lib/utils";
import { JsonObject } from "@/types/json";
import { TaskListItem } from "@/types/tasks";
import { useLocale } from "next-intl";
import React, { useMemo } from "react";
import { useMediaPreviewAtTaskList } from "../hooks/useMediaPreviewAtTaskListr";
import { getTaskMediaGridItem } from "../ItemWidgetMapping";
import { taskImageGridClassName } from "../item-style.config";

interface MediaData {
  original_object_id?: string;
  compressed_object_id?: string;
  source_url?: string;
  source_file_name?: string;
  source_width?: number;
  source_height?: number;
  source_file_size?: number;
  duration?: number;
  stream_audio_url?: string;
  image_url?: string;
  title?: string;
  tags?: string;
  original_image_object_id?: string;
  compressed_image_object_id?: string;
}

interface MediaGridProps<T extends MediaData> {
  task: TaskListItem;
  mediaType: "image" | "video" | "audio";
  getMediaFromResponse: (response: unknown) => T[] | undefined;
  getDefaultFileName: () => string;
}

export function MediaGrid<T extends MediaData>({
  task,
  mediaType,
  getMediaFromResponse,
  getDefaultFileName,
}: MediaGridProps<T>) {
  const { openPreview } = useMediaPreview();
  const { openRecreateDialog } = useRecreateTask();
  const locale = useLocale() as Locale;
  const invokerConfig = useTaskInvokerConfig(task);
  const { createPreviewConfig } = useMediaPreviewAtTaskList(task, locale);

  // Get the appropriate MediaGridItem component based on task type
  const MediaGridItemComponent = getTaskMediaGridItem(
    task.taskType as TaskType,
    task.metadata as JsonObject
  );

  const completedSubTasks = task.subTasks.filter(
    (subTask) => subTask.status === TaskStatus.COMPLETED
  );

  const { gridElements } = useMemo(() => {
    if (completedSubTasks.length === 0 || !MediaGridItemComponent) {
      return { allMediaItems: [], allSidebarItems: [], gridElements: [] };
    }
    const allMediaItems: MediaItem[] = [];
    const allSidebarItems: React.ReactNode[] = [];
    const gridElements: React.ReactNode[] = [];
    let globalIndexCounter = 0;

    completedSubTasks.forEach((subTask) => {
      const mediaItems = getMediaFromResponse(subTask.response);
      if (!mediaItems || mediaItems.length === 0) return;

      let subRequest: Record<string, unknown> = {};
      try {
        subRequest =
          typeof subTask.request === "string"
            ? JSON.parse(subTask.request)
            : (subTask.request as Record<string, unknown>) || {};
      } catch {
        subRequest = {};
      }

      // Prepare media data for preview config
      const mediaDataForPreview = mediaItems.map((item) => ({
        type: mediaType,
        url:
          getObjectUrl(item.compressed_object_id || item.original_object_id) ||
          item.source_url ||
          "",
        fileName: item.source_file_name ?? item.source_url ?? getDefaultFileName(),
        width: item.source_width,
        height: item.source_height,
        fileSize: item.source_file_size,
        imageUrl: item.image_url,
        originalImageObjectId: item.original_image_object_id,
        compressedImageObjectId: item.compressed_image_object_id,
      }));

      // Create preview config
      const previewConfig = createPreviewConfig(subTask, subRequest, mediaDataForPreview);

      // Add to global arrays
      allMediaItems.push(...previewConfig.mediaItems);
      allSidebarItems.push(...previewConfig.sidebarItems);

      // Create grid items
      mediaItems.forEach((item, index) => {
        const mediaUrl =
          getObjectUrl(item.compressed_object_id || item.original_object_id) || item.source_url;
        const fileName = item.source_file_name ?? item.source_url ?? getDefaultFileName();
        const currentIndex = globalIndexCounter;
        globalIndexCounter += 1;

        gridElements.push(
          <MediaGridItemComponent
            key={`${subTask.id}-${index}`}
            task={task}
            subTask={subTask}
            subRequest={subRequest}
            mediaUrl={mediaUrl || ""}
            fileName={fileName}
            originalObjectId={item.original_object_id}
            compressedObjectId={item.compressed_object_id}
            sourceUrl={item.source_url}
            width={item.source_width}
            height={item.source_height}
            fileSize={item.source_file_size}
            originalImageObjectId={item.original_image_object_id}
            compressedImageObjectId={item.compressed_image_object_id}
            imageUrl={item.image_url}
            onClick={() => {
              openPreview(allMediaItems, currentIndex, allSidebarItems);
            }}
            onRecreate={(e: React.MouseEvent) => {
              e.stopPropagation();
              openRecreateDialog(invokerConfig, subRequest as JsonObject, mediaType);
            }}
            showRecreate={!!invokerConfig}
          />
        );
      });
    });

    return { allMediaItems, allSidebarItems, gridElements };
  }, [
    completedSubTasks,
    getMediaFromResponse,
    getDefaultFileName,
    mediaType,
    createPreviewConfig,
    openPreview,
    openRecreateDialog,
    invokerConfig,
    task,
    MediaGridItemComponent,
  ]);

  if (gridElements.length === 0) {
    return null;
  }

  return <div className={taskImageGridClassName}>{gridElements}</div>;
}
