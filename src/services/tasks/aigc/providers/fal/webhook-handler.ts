import { ResultType } from "@/conifg/aigc/types";
import { TaskStatus } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
import { checkSubTasksAndUpdateTaskStatus } from "@/services/tasks/utils/checkSubTasksAndUpdateTaskStatus";
import { ImageResultItem, ImagesResult, VideoResult } from "../../types";
import { postProcessImageSubTask } from "../../utils/images/post-processing-image";
import { postProcessVideoSubTask } from "../../utils/videos/post-processing-video";

interface ImageInfo {
  url: string;
  content_type: string;
  file_name: string;
  file_size: number;
  width: number;
  height: number;
}

interface VideoInfo {
  url: string;
  file_size?: number;
  file_name?: string;
  content_type?: string;
}

interface SuccessPayload {
  images?: ImageInfo[];
  video?: VideoInfo;
  seed: number;
}

interface ErrorDetail {
  loc: string[];
  msg: string;
  type: string;
}

interface ErrorPayload {
  detail: ErrorDetail[];
}

export interface WebhookResponse {
  request_id: string;
  gateway_request_id: string;
  status: "OK" | "ERROR";
  payload: SuccessPayload | ErrorPayload | null;
  error?: string;
  payload_error?: string;
}

export async function handleFalWebhook({
  body,
  taskId,
  subTaskId,
  resultType,
}: {
  body: WebhookResponse;
  taskId: string;
  subTaskId: string;
  resultType: ResultType;
}) {
  const subTask = await prisma.subTask.findUnique({
    where: { id: subTaskId },
  });

  if (!subTask) {
    console.error("SubTask not found:", subTaskId);
    return;
  }

  if (subTask.status === TaskStatus.COMPLETED) {
    console.log("SubTask already completed:", subTaskId);
    return;
  }

  // Convert to standard result format
  const standardResult = convertToStandardResult(body, resultType);

  let status: TaskStatus;
  let response = {};

  if ("error" in standardResult) {
    status = TaskStatus.FAILED;
    response = {
      error: standardResult.error,
    };
  } else {
    status = TaskStatus.COMPLETED;
    response = {
      request_id: body.request_id,
      result_type: resultType,
      completedAt: new Date().toISOString(),
      ...standardResult,
    };
  }

  const updatedSubTask = await prisma.subTask.update({
    where: {
      id: subTaskId,
    },
    data: {
      status: status,
      response: response,
    },
    include: {
      task: {
        select: {
          userId: true,
          isPublic: true,
          id: true,
        },
      },
    },
  });

  if (updatedSubTask) {
    if (status === TaskStatus.COMPLETED) {
      if (resultType === ResultType.IMAGE) {
        postProcessImageSubTask(updatedSubTask); // to ensure the image is saved and converted a
      } else if (resultType === ResultType.VIDEO) {
        postProcessVideoSubTask(updatedSubTask); // to ensure the video is saved and converted
      }
    }
    checkSubTasksAndUpdateTaskStatus(taskId);
  }
  return {
    status: "success",
    message: "Webhook processed successfully",
    requestId: body.request_id,
  };
}

/**
 * Converts FAL webhook response to standard result format
 */
export function convertToStandardResult(
  body: WebhookResponse,
  resultType: ResultType
): ImagesResult | VideoResult | { error: string | ErrorDetail[] } {
  if (body.status === "ERROR") {
    const detail = (body.payload as ErrorPayload)?.detail || body.error;
    return {
      error: detail,
    };
  }

  if (body.payload_error) {
    return {
      error: body.payload_error,
    };
  }

  if (body.status === "OK" && body.payload) {
    const payload = body.payload as SuccessPayload;

    if (resultType === ResultType.IMAGE) {
      if (payload.images && payload.images.length > 0) {
        return {
          images: payload.images.map(
            (image): ImageResultItem => ({
              source_url: image.url,
              source_content_type: image.content_type,
              source_file_name: image.file_name || image.url.split("/").pop() || "image",
              source_file_size: image.file_size,
              source_width: image.width,
              source_height: image.height,
            })
          ),
        } as ImagesResult;
      } else {
        // Return empty images result if no images
        return {
          images: [],
        } as ImagesResult;
      }
    }

    if (resultType === ResultType.VIDEO) {
      if (payload.video) {
        return {
          videos: [
            {
              source_url: payload.video.url,
              source_content_type: payload.video.content_type || "video/mp4",
              source_file_name:
                payload.video.file_name || payload.video.url.split("/").pop() || "video.mp4",
              source_file_size: payload.video.file_size || 0,
            },
          ],
        } as VideoResult;
      } else {
        // Return empty videos result if no video
        return {
          videos: [],
        } as VideoResult;
      }
    }
  }

  // Fallback: return error for unsupported result types or missing data
  return {
    error: `No valid ${resultType} data found in FAL response`,
  };
}
