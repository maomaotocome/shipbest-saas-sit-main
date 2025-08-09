import { ResultType } from "@/conifg/aigc/types";
import { Prisma, TaskStatus } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
import { checkSubTasksAndUpdateTaskStatus } from "@/services/tasks/utils/checkSubTasksAndUpdateTaskStatus";
import { JsonObject } from "@/types/json";
import {
  AudioResult,
  AudioResultItem,
  ImageResultItem,
  ImagesResult,
  VideoResult,
  VideoResultItem,
} from "../../types";
import { postProcessAudioSubTask } from "../../utils/audios/post-processing-audio";
import { postProcessImageSubTask } from "../../utils/images/post-processing-image";
import { postProcessVideoSubTask } from "../../utils/videos/post-processing-video";
import { getVeo31080pVideo as getVeo3_1080pVideo } from "./submit";

export interface KieAiWebhookData {
  code: number;
  msg: string;
  data: JsonObject;
}

export interface KieAiVeo3WebhookData {
  code: number;
  msg: string;
  data: {
    task_id: string;
    video_url?: string;
    image_url?: string;
    prompt?: string;
    model_name?: string;
    createTime?: string;
    duration?: number;
    [key: string]: unknown;
  };
}

export interface KieAiSunoWebhookData {
  code: number;
  msg: string;
  data: {
    callbackType: "text" | "first" | "complete";
    task_id: string;
    data: Array<{
      id: string;
      audio_url: string;
      stream_audio_url?: string;
      image_url?: string;
      prompt: string;
      model_name: string;
      title: string;
      tags: string;
      createTime: string;
      duration: number;
    }>;
  };
}

export async function handleKieAiWebhook({
  subTaskId,
  taskId,
  resultType,
  webhookData,
}: {
  subTaskId: string;
  taskId: string;
  resultType: ResultType;
  webhookData: KieAiWebhookData;
}): Promise<void> {
  console.log("Handling Kie.ai webhook:", { webhookData, subTaskId });

  try {
    const subTask = await prisma.subTask.findUnique({
      where: { id: subTaskId },
      include: {
        task: {
          select: {
            userId: true,
            isPublic: true,
            id: true,
            taskType: true,
          },
        },
      },
    });

    if (!subTask) {
      console.error("SubTask not found:", subTaskId);
      return;
    }

    if (subTask.status === TaskStatus.COMPLETED) {
      console.log("SubTask already completed:", subTaskId);
      return;
    }

    if (webhookData.code === 200) {
      // Success case
      const status = TaskStatus.COMPLETED;
      const standardResult = convertToStandardResult(webhookData, resultType);
      const response = {
        result_type: resultType,
        completedAt: new Date().toISOString(),
        ...standardResult,
      };

      const updatedSubTask = await prisma.subTask.update({
        where: { id: subTaskId },
        data: {
          status,
          response: response as Prisma.InputJsonValue,
        },
        include: {
          task: {
            select: {
              userId: true,
              isPublic: true,
              id: true,
              taskType: true,
            },
          },
        },
      });

      // Special handling for Veo3 models - try to get 1080p version after delay
      if (
        resultType === ResultType.VIDEO &&
        typeof updatedSubTask.request === "object" &&
        updatedSubTask.request !== null &&
        "model" in updatedSubTask.request &&
        typeof (updatedSubTask.request as { model?: string }).model === "string" &&
        (updatedSubTask.request as { model: string }).model.includes("veo3") &&
        webhookData.data.taskId
      ) {
        setTimeout(
          async () => {
            await tryGet1080pVideo(updatedSubTask, webhookData as KieAiVeo3WebhookData);
          },
          2 * 60 * 1000
        ); // Wait 2 minutes before trying to get 1080p
      }

      // Post-process based on result type
      if (resultType === ResultType.IMAGE) {
        postProcessImageSubTask(updatedSubTask);
      } else if (resultType === ResultType.VIDEO) {
        postProcessVideoSubTask(updatedSubTask);
      } else if (resultType === ResultType.AUDIO) {
        postProcessAudioSubTask(updatedSubTask);
      }

      console.log("SubTask completed successfully:", subTaskId);
    } else {
      // Error case
      const status = TaskStatus.FAILED;
      const errorMessage = webhookData.msg || "Unknown error from Kie.ai";

      // Store error in response field as JSON
      const errorResponse = {
        error: errorMessage,
        code: webhookData.code,
        msg: webhookData.msg,
        data: webhookData.data,
      };

      await prisma.subTask.update({
        where: { id: subTaskId },
        data: {
          status,
          response: errorResponse as Prisma.InputJsonValue,
        },
      });

      console.error("SubTask failed:", subTaskId, errorMessage);
    }

    // Check if all subtasks are completed and update task status
    checkSubTasksAndUpdateTaskStatus(taskId);
  } catch (error) {
    console.error("Error handling Kie.ai webhook:", error);

    // Update subtask as failed
    const errorResponse = {
      error: error instanceof Error ? error.message : "Unknown error",
      failedAt: new Date().toISOString(),
    };

    await prisma.subTask.update({
      where: { id: subTaskId },
      data: {
        status: TaskStatus.FAILED,
        response: errorResponse as Prisma.InputJsonValue,
      },
    });
  }
}

/**
 * Converts Kie.ai webhook response to standard result format
 */
export function convertToStandardResult(
  webhookData: KieAiWebhookData,
  resultType: ResultType
): ImagesResult | VideoResult | AudioResult | { error: string } {
  if (webhookData.code !== 200) {
    return {
      error: webhookData.msg || "Unknown error from Kie.ai",
    };
  }

  const data = webhookData.data;

  if (resultType === ResultType.VIDEO) {
    // Handle new data structure with info.resultUrls or info.result_urls
    const info = (data.info || data.response) as JsonObject;
    const resultUrls = (info?.resultUrls || info?.result_urls) as string[];

    if (resultUrls && Array.isArray(resultUrls) && resultUrls.length > 0) {
      const videoUrl = resultUrls[0]; // Use the first video URL
      return {
        videos: [
          {
            source_url: videoUrl,
            source_content_type: "video/mp4",
            source_file_name: videoUrl.split("/").pop() || "video.mp4",
            source_file_size: 0, // Will be updated during post-processing
            resolution: "720p", // Default resolution for initial video
          } as VideoResultItem,
        ],
        // Include additional metadata
        prompt: data.prompt,
        model_name: data.model_name,
        duration: data.duration,
        kie_ai_task_id: data.taskId || data.task_id, // Support both taskId and task_id
        createTime: data.createTime,
      } as VideoResult;
    } else {
      // Return empty video result with metadata if no video URLs found
      return {
        videos: [],
        prompt: data.prompt,
        model_name: data.model_name,
        duration: data.duration,
        task_id: data.taskId || data.task_id, // Support both taskId and task_id
        createTime: data.createTime,
      } as VideoResult;
    }
  }

  if (resultType === ResultType.AUDIO) {
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      // Handle Suno audio response - process all audio items
      const audioItems = data.data
        .filter(
          (item): item is JsonObject =>
            typeof item === "object" && item !== null && !Array.isArray(item)
        )
        .map((audioData) => ({
          source_url: (audioData.audio_url as string) || (audioData.stream_audio_url as string),
          source_content_type: "audio/mpeg",
          source_file_name: (audioData.audio_url as string).split("/").pop() || "audio.mp3",
          source_file_size: 0, // Will be updated during post-processing
          duration: audioData.duration as number,
          stream_audio_url: audioData.stream_audio_url as string,
          image_url: audioData.image_url as string,
          title: audioData.title as string,
          tags: audioData.tags as string,
        })) as AudioResultItem[];

      return {
        audios: audioItems,
        kie_ai_task_id: data.task_id,
      } as AudioResult;
    } else {
      // Return empty audio result with metadata
      return {
        audios: [],
        kie_ai_task_id: data.task_id,
      } as AudioResult;
    }
  }

  if (resultType === ResultType.IMAGE) {
    if (data.image_url) {
      return {
        images: [
          {
            source_url: data.image_url as string,
            source_content_type: "image/jpeg",
            source_file_name: (data.image_url as string).split("/").pop() || "image.jpg",
            source_file_size: 0, // Will be updated during post-processing
          } as ImageResultItem,
        ],
        // Include additional metadata
        prompt: data.prompt,
        model_name: data.model_name,
        task_id: data.task_id,
        createTime: data.createTime,
      } as ImagesResult;
    } else {
      // Return empty image result with metadata
      return {
        images: [],
        prompt: data.prompt,
        model_name: data.model_name,
        task_id: data.task_id,
        createTime: data.createTime,
      } as ImagesResult;
    }
  }

  // Fallback: return error for unsupported result types
  return {
    error: `Unsupported result type: ${resultType}`,
  };
}

/**
 * Try to get 1080p video for Veo3 models (specific business logic)
 */
async function tryGet1080pVideo(
  subTask: Prisma.SubTaskGetPayload<{
    include: {
      task: {
        select: {
          userId: true;
          isPublic: true;
          id: true;
          taskType: true;
        };
      };
    };
  }>,
  webhookData: KieAiVeo3WebhookData
): Promise<void> {
  try {
    // Get API key from environment or database
    const apiKey = process.env.KIE_AI_API_KEY;
    if (!apiKey) {
      console.warn("KIE_AI_API_KEY not found, skipping 1080p video retrieval");
      return;
    }

    const taskId = webhookData.data.taskId as string;
    const result = await getVeo3_1080pVideo(taskId, apiKey);

    if (result.success && result.data && result.data.resultUrl) {
      // Update the subtask with 1080p video as a separate VideoResultItem
      const currentResponse = subTask.response as JsonObject;
      const currentVideos = (currentResponse.videos as VideoResultItem[]) || [];

      // Create the 1080p video as a separate VideoResultItem object
      const videoUrl = result.data.resultUrl as string;
      const video1080p: VideoResultItem = {
        source_url: videoUrl,
        source_content_type: "video/mp4",
        source_file_name: videoUrl.split("/").pop() || "video_1080p.mp4",
        source_file_size: 0, // Will be updated during post-processing
        resolution: "1080p",
      };

      const updatedResponse = {
        ...currentResponse,
        videos: [...currentVideos, video1080p],
      };

      const updatedSubTask = await prisma.subTask.update({
        where: { id: subTask.id },
        data: {
          response: updatedResponse as Prisma.InputJsonValue,
        },
        include: {
          task: {
            select: {
              userId: true,
              isPublic: true,
              id: true,
              taskType: true,
            },
          },
        },
      });

      // Trigger post-processing for the new 1080p video
      postProcessVideoSubTask(updatedSubTask);

      console.log("1080p video added as separate VideoResultItem for subtask:", subTask.id);
    } else {
      console.log("1080p video not ready yet for task:", taskId);
    }
  } catch (error) {
    console.error("Error getting 1080p video:", error);
  }
}
