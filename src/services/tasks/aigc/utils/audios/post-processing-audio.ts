import { Prisma, TaskStatus } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
import { JsonObject } from "@/types/json";
import { imageSaveAndCompressAndGetInfo } from "../images/image-save-and-compress";
import { audioSave } from "./audio-save-and-compress";

export async function postProcessAudioSubTask(
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
  console.log("postProcessAudioSubTask", subTask);

  if (subTask.response && subTask.status === TaskStatus.COMPLETED) {
    const response = subTask.response as unknown as {
      audios?: {
        source_url: string;
        source_file_name?: string;
        source_content_type?: string;
        duration?: number;
        title?: string;
        tags?: string;
        stream_audio_url?: string;
        image_url?: string;
      }[];
    };

    if (response.audios && Array.isArray(response.audios) && response.audios.length > 0) {
      const processedAudios = [] as {
        source_url: string;
        source_file_name?: string;
        source_content_type?: string;
        source_file_size: number;
        duration?: number;
        title?: string;
        tags?: string;
        stream_audio_url?: string;
        image_url?: string;
        original_object_id: string;
        original_image_object_id?: string;
        compressed_image_object_id?: string;
      }[];

      for (const audio of response.audios) {
        // Process audio file
        const audioUrl = audio.source_url || audio.stream_audio_url;
        if (!audioUrl) {
          console.error("No audio URL found for audio:", audio);
          continue;
        }
        const { originalObject, fileSize } = await audioSave({
          audioUrl,
          fileName: audio.source_file_name || audio.source_url.split("/").pop() || "audio.mp3",
          type:
            (audio.source_content_type as "audio/mp3" | "audio/mpeg" | "audio/wav" | "audio/ogg") ||
            "audio/mp3",
          userId: subTask.task.userId ?? undefined,
          isPublic: subTask.task.isPublic ?? false,
          taskInfo: {
            taskId: subTask.task.id,
            subTaskId: subTask.id,
          },
          duration: audio.duration,
          title: audio.title,
          tags: audio.tags,
        });

        let originalImageObject = undefined;
        let compressedImageObject = undefined;

        // Process cover image if available
        if (audio.image_url) {
          try {
            const imageFileName = audio.image_url.split("/").pop() || "cover.jpg";
            const imageType = imageFileName.toLowerCase().endsWith(".png")
              ? "image/png"
              : "image/jpeg";

            const imageResult = await imageSaveAndCompressAndGetInfo({
              imageUrl: audio.image_url,
              fileName: imageFileName,
              type: imageType,
              userId: subTask.task.userId ?? undefined,
              isPublic: subTask.task.isPublic ?? false,
              taskInfo: {
                taskId: subTask.task.id,
                subTaskId: subTask.id,
              },
            });

            originalImageObject = imageResult.originalObject;
            compressedImageObject = imageResult.compressedObject;
          } catch (error) {
            console.error("Error processing audio cover image:", error);
          }
        }

        processedAudios.push({
          ...audio,
          source_file_size: fileSize,
          original_object_id: originalObject.id,
          original_image_object_id: originalImageObject?.id,
          compressed_image_object_id: compressedImageObject?.id,
        });
      }

      // Update the response with processed audio information
      await prisma.subTask.update({
        where: { id: subTask.id },
        data: {
          response: {
            ...(subTask.response as JsonObject),
            audios: processedAudios,
            postProcessingCompletedAt: new Date().toISOString(),
          },
        },
      });
    }
  }
}
