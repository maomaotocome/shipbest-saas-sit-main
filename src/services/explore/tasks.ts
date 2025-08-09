import { createExploreItem } from "@/db/explore/items";
import { getTaskWithSubTasks } from "@/db/explore/tasks";
import { ExploreItem, ExploreItemStatus, Prisma } from "@/db/generated/prisma";
import { PaginationParams } from "@/types/pagination";

export interface GetPublicTasksParams extends PaginationParams {
  taskType?: string;
  status?: string;
  search?: string;
}

export interface TaskMediaObject {
  subTaskId: string;
  objectId: string;
  type: "image" | "video";
  url: string;
  width?: number;
  height?: number;
  fileName?: string;
  alreadyInExplore: boolean;
}

export interface GetTaskMediaObjectsResult {
  taskInfo: {
    id: string;
    taskType: string;
    metadata: unknown;
    request: unknown;
    isPublic: boolean;
    createdAt: Date;
  };
  mediaObjects: TaskMediaObject[];
}

export async function getPublicTasksForExplore(
  params: GetPublicTasksParams
): Promise<{ tasks: Record<string, unknown>[]; total: number }> {
  const { page = 1, pageSize = 20, taskType, status, search } = params;

  const where: Record<string, unknown> = {
    isPublic: true,
    status: status || "COMPLETED",
  };

  if (taskType && taskType !== "ALL") {
    where.taskType = { contains: taskType };
  }

  if (search) {
    where.OR = [{ id: { contains: search } }, { taskType: { contains: search } }];
  }

  const { prisma } = await import("@/lib/prisma");

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        subTasks: {
          where: {
            status: "COMPLETED",
          },
          select: {
            id: true,
            response: true,
            createdAt: true,
          },
        },
        exploreItems: {
          select: {
            id: true,
            objectId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, total };
}

export async function getTaskMediaObjects(taskId: string): Promise<GetTaskMediaObjectsResult> {
  const task = await getTaskWithSubTasks(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  const existingObjectIds = new Set(task.exploreItems.map((item) => item.objectId));
  const mediaObjects: TaskMediaObject[] = [];

  for (const subTask of task.subTasks) {
    const response = subTask.response as Record<string, unknown>;

    // Process images
    if (response.images && Array.isArray(response.images)) {
      for (const image of response.images) {
        const objectId = image.original_object_id || image.compressed_object_id;
        if (objectId) {
          mediaObjects.push({
            subTaskId: subTask.id,
            objectId,
            type: "image" as const,
            url: image.source_url,
            width: image.source_width,
            height: image.source_height,
            fileName: image.source_file_name,
            alreadyInExplore: existingObjectIds.has(objectId),
          });
        }
      }
    }

    // Process videos
    if (response.videos && Array.isArray(response.videos)) {
      for (const video of response.videos) {
        const objectId = video.original_object_id || video.compressed_object_id;
        if (objectId) {
          mediaObjects.push({
            subTaskId: subTask.id,
            objectId,
            type: "video" as const,
            url: video.source_url,
            width: video.source_width,
            height: video.source_height,
            fileName: video.source_file_name,
            alreadyInExplore: existingObjectIds.has(objectId),
          });
        }
      }
    }
  }

  return {
    taskInfo: {
      id: task.id,
      taskType: task.taskType,
      metadata: task.metadata,
      request: task.request,
      isPublic: task.isPublic,
      createdAt: task.createdAt,
    },
    mediaObjects,
  };
}

export async function createExploreItemFromTask(
  taskId: string,
  subTaskId: string,
  index: number
): Promise<ExploreItem> {
  const task = await getTaskWithSubTasks(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  const subTask = task.subTasks.find((st) => st.id === subTaskId);
  if (!subTask) {
    throw new Error("SubTask not found");
  }

  // Extract object information from response
  const response = subTask.response as Record<string, unknown>;
  let objectInfo: {
    width?: number;
    height?: number;
    public_url?: string;
    source_url?: string;
    source_width?: number;
    source_height?: number;
  } | null = null;
  let mediaType = "image";

  // Find object information
  if (response.images && Array.isArray(response.images)) {
    objectInfo =
      (response.images[index] as
        | {
            width?: number;
            height?: number;
            public_url?: string;
            source_url?: string;
            source_width?: number;
            source_height?: number;
          }
        | undefined) || null;
    mediaType = "image";
  } else if (response.videos && Array.isArray(response.videos)) {
    objectInfo =
      (response.videos[index] as
        | {
            width?: number;
            height?: number;
            public_url?: string;
            source_url?: string;
            source_width?: number;
            source_height?: number;
          }
        | undefined) || null;
    mediaType = "video";
  }

  if (!objectInfo) {
    throw new Error("Object not found in task response");
  }

  // Create explore item
  const exploreItemData: Prisma.ExploreItemCreateInput = {
    objectId: objectInfo.source_url,
    publicUrl: objectInfo.source_url || objectInfo.public_url || "",
    width: objectInfo.source_width || objectInfo.width || (mediaType === "image" ? 1024 : 1920),
    height: objectInfo.source_height || objectInfo.height || (mediaType === "image" ? 1024 : 1080),
    type: mediaType,
    taskType: task.taskType,
    originalRequest: task.request as unknown as Prisma.InputJsonValue,
    originalMetadata: task.metadata as unknown as Prisma.InputJsonValue,
    status: ExploreItemStatus.PENDING,
    isVisible: false,
    featured: false,
    task: {
      connect: { id: taskId },
    },
    subTask: {
      connect: { id: subTaskId },
    },
    user: {
      connect: { id: task.userId ?? "" },
    },
  };

  return await createExploreItem(exploreItemData);
}
