import { Prisma, TaskStatus } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
import { JsonObject } from "@/types/json";
import { imageSaveAndCompressAndGetInfo } from "./image-save-and-compress";
export async function postProcessImageSubTask(
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
  console.log("postProcessImageSubTask", subTask);
  if (subTask.response && subTask.status === TaskStatus.COMPLETED) {
    const response = subTask.response as unknown as {
      images: { source_url: string; source_file_name: string; source_content_type: string }[];
    };
    const images = [];
    for (const image of response.images) {
      const { originalObject, compressedObject, imageInfo } = await imageSaveAndCompressAndGetInfo({
        imageUrl: image.source_url,
        fileName: image.source_file_name || image.source_url.split("/").pop() || "",
        type: image.source_content_type as "image/png" | "image/jpg" | "image/jpeg" | "image/webp",
        userId: subTask.task.userId ?? undefined,
        isPublic: subTask.task.isPublic ?? false,
        taskInfo: {
          taskId: subTask.task.id,
          subTaskId: subTask.id,
        },
      });
      images.push({
        ...image,
        source_file_size: imageInfo.size,
        source_width: imageInfo.width,
        source_height: imageInfo.height,
        original_object_id: originalObject.id,
        compressed_object_id: compressedObject.id,
      });
    }
    await prisma.subTask.update({
      where: { id: subTask.id },
      data: {
        response: {
          ...(subTask.response as JsonObject),
          images,
          postProcessingCompletedAt: new Date().toISOString(),
        },
      },
    });
  }
}
