import { MediaItem } from "./types";

export const extractMediaItems = (task: Record<string, unknown>): MediaItem[] => {
  const taskMediaItems: MediaItem[] = [];
  
  for (const subTask of task.subTasks as Array<Record<string, unknown>>) {
    const response = (subTask.response as Record<string, unknown>) || {};

    // Process images
    if (Array.isArray(response.images)) {
      response.images.forEach((image: Record<string, unknown>, index: number) => {
        const objectId = image.original_object_id || image.compressed_object_id || image.source_url;
        if (objectId) {
          taskMediaItems.push({
            taskId: String(task.id),
            subTaskId: String(subTask.id),
            index,
            type: 'image',
            url: String(image.source_url || image.public_url || ''),
            width: image.source_width ? Number(image.source_width) : undefined,
            height: image.source_height ? Number(image.source_height) : undefined,
            objectId: String(objectId),
          });
        }
      });
    }

    // Process videos
    if (Array.isArray(response.videos)) {
      response.videos.forEach((video: Record<string, unknown>, index: number) => {
        const objectId = video.original_object_id || video.compressed_object_id || video.source_url;
        if (objectId) {
          taskMediaItems.push({
            taskId: String(task.id),
            subTaskId: String(subTask.id),
            index,
            type: 'video',
            url: String(video.source_url || video.public_url || ''),
            width: video.source_width ? Number(video.source_width) : undefined,
            height: video.source_height ? Number(video.source_height) : undefined,
            objectId: String(objectId),
          });
        }
      });
    }
  }

  return taskMediaItems;
};