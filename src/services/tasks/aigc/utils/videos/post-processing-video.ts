import { Prisma, TaskStatus } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
import { videoSave } from "./video-save-and-convert";

export async function postProcessVideoSubTask(
  subTask: Prisma.SubTaskGetPayload<{
    include: {
      task: {
        select: {
          userId: true;
          isPublic: true;
          id: true;
        };
      };
    };
  }>
) {
  console.log("postProcessVideoSubTask", subTask);

  if (subTask.response && subTask.status === TaskStatus.COMPLETED) {
    const response = subTask.response as unknown as {
      videos?: {
        source_url: string;
        source_file_name?: string;
        source_content_type?: string;
      }[];
    };

    if (response.videos && Array.isArray(response.videos) && response.videos.length > 0) {
      const processedVideos = [] as {
        source_url: string;
        source_file_name?: string;
        source_content_type?: string;
        source_file_size: number;
        original_object_id: string;
      }[];

      for (const video of response.videos) {
        const { originalObject, fileSize } = await videoSave({
          videoUrl: video.source_url,
          fileName: video.source_file_name || video.source_url.split("/").pop() || "video.mp4",
          type:
            (video.source_content_type as "video/mp4" | "video/webm" | "video/avi") || "video/mp4",
          userId: subTask.task.userId ?? undefined,
          isPublic: subTask.task.isPublic ?? false,
          taskInfo: {
            taskId: subTask.task.id,
            subTaskId: subTask.id,
          },
        });

        processedVideos.push({
          ...video,
          source_file_size: fileSize,
          original_object_id: originalObject.id,
        });
      }

      // Update the response with processed video information
      await prisma.subTask.update({
        where: { id: subTask.id },
        data: {
          response: {
            postProcessingCompletedAt: new Date().toISOString(),
            ...(subTask.response as Record<string, unknown>),
            videos: processedVideos,
          },
        },
      });
    }
  }
}
