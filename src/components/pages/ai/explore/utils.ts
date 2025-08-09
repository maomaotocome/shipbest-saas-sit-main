import { MediaItem } from "@/components/common/ai/MediaPreview/MediaPreviewDialog";
import { ExploreItem, TaskStatus } from "@/db/generated/prisma";
import { TaskType } from "@/lib/constants";
import { formatDateI18n } from "@/lib/utils";
import { JsonObject } from "@/types/json";

export function transformToGalleryImages(
  items: ExploreItem[],
  t: (key: string) => string,
  locale: string
) {
  return items.map((item) => ({
    id: item.id,
    src: item.publicUrl,
    width: item.width,
    height: item.height,
    type: item.type as "image" | "video",
    alt: `${item.type} - ${formatDateI18n(new Date(item.createdAt), locale)}`,
    buttonText: t("gallery.viewDetails"),
  }));
}

export function createMediaItems(previewItem: ExploreItem): MediaItem[] {
  return [
    {
      type: previewItem.type as "image" | "video",
      url: previewItem.publicUrl,
      fileName: `explore-${previewItem.id}.${previewItem.type === "video" ? "mp4" : "jpg"}`,
    },
  ];
}

export function parseOriginalRequest(originalRequest: unknown): Record<string, unknown> {
  try {
    return typeof originalRequest === "string"
      ? JSON.parse(originalRequest)
      : (originalRequest as Record<string, unknown>) || {};
  } catch {
    return {};
  }
}

export function createMockTask(previewItem: ExploreItem) {
  return {
    id: previewItem.taskId || "unknown",
    taskType: previewItem.taskType,
    metadata: previewItem.originalMetadata,
    createdAt: previewItem.createdAt,
    subTasks: [],
    userId: "unknown",
    status: TaskStatus.COMPLETED,
    isPublic: true,
    credits: null,
    actualCredits: null,
    systemRequest: {},
    request: previewItem.originalRequest || {},
    response: {},
    updatedAt: previewItem.createdAt,
    user: null,
  };
}

export function createMockSubTask(previewItem: ExploreItem) {
  return {
    id: previewItem.id,
    status: TaskStatus.COMPLETED,
    createdAt: previewItem.createdAt,
    credits: null,
    systemRequest: {},
    request: previewItem.originalRequest || {},
    response: {},
    updatedAt: previewItem.createdAt,
    taskId: null,
  };
}

export function createInvokerConfig(item: ExploreItem) {
  if (!item.originalMetadata) {
    return null;
  }

  if (item.taskType === TaskType.Template) {
    return {
      taskType: TaskType.Template as const,
      metadata: item.originalMetadata as JsonObject,
    };
  } else if (item.taskType === TaskType.ModelDirectInvocation) {
    return {
      taskType: TaskType.ModelDirectInvocation as const,
      metadata: item.originalMetadata as JsonObject,
    };
  }

  return null;
}
