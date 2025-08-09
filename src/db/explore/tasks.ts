import { prisma } from "@/lib/prisma";
import { ExploreItem, SubTask, Task } from "../generated/prisma";

export interface TaskWithSubTasks extends Task {
  subTasks: SubTask[];
  exploreItems: Pick<ExploreItem, "id" | "objectId">[];
}

export async function getTaskWithSubTasks(taskId: string): Promise<TaskWithSubTasks | null> {
  return prisma.task.findUnique({
    where: { id: taskId },
    include: {
      subTasks: {
        where: { status: "COMPLETED" },
      },
      exploreItems: {
        select: { id: true, objectId: true },
      },
    },
  });
}

export async function getTaskMediaObjects(taskId: string) {
  const task = await getTaskWithSubTasks(taskId);

  if (!task) {
    return null;
  }

  const existingObjectIds = new Set(task.exploreItems.map((item) => item.objectId));
  const mediaObjects: Array<{
    subTaskId: string;
    objectId: string;
    type: "image" | "video";
    url: string;
    width?: number;
    height?: number;
    fileName?: string;
    alreadyInExplore: boolean;
  }> = [];

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
