import { ResultType } from "@/conifg/aigc/types";
import { Prisma, TaskStatus } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
import { checkSubTasksAndUpdateTaskStatus } from "@/services/tasks/utils/checkSubTasksAndUpdateTaskStatus";
import { ImageResultItem, ImagesResult } from "../../types";
import { postProcessImageSubTask } from "../../utils/images/post-processing-image";

export async function handleOpenAINextResponse(
  response: Response | null,
  uuid: string,
  taskId: string,
  subTaskId: string,
  error?: Error
) {
  try {
    const subTask = await prisma.subTask.findUnique({
      where: { id: subTaskId },
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

    if (!subTask) {
      console.error("SubTask not found:", subTaskId);
      return;
    }

    if (error || !response) {
      await handleOpenAINextError(
        error || new Error("No response received"),
        uuid,
        taskId,
        subTaskId
      );
      return;
    }

    if (!response.body) {
      await handleOpenAINextError(new Error("Response body is null"), uuid, taskId, subTaskId);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.substring(6).trim();
          if (jsonStr === "[DONE]" || !jsonStr) continue;
          try {
            const data = JSON.parse(jsonStr);
            if (data.choices && data.choices[0] && data.choices[0].delta) {
              fullContent += data.choices[0].delta.content || "";
            }
          } catch {
            console.error("Failed to parse JSON:", jsonStr);
          }
        }
      }
    }

    const matches = Array.from(fullContent.matchAll(/\[(.*?)\]\((.*?)\)/g));
    const downloadLinkMatch = matches[matches.length - 1] as RegExpMatchArray;
    if (downloadLinkMatch && downloadLinkMatch[2]) {
      const url = downloadLinkMatch[2];
      const filename = url.split("/").pop() || `${uuid}.png`;
      // Convert to standard result format
      const standardResult: ImagesResult = {
        images: [
          {
            source_url: url,
            source_content_type: "image/png",
            source_file_name: filename,
            source_file_size: 0, // Will be updated during post-processing
          } as ImageResultItem,
        ],
      };

      const updatedSubTask = await prisma.subTask.update({
        where: {
          id: subTaskId,
        },
        data: {
          status: TaskStatus.COMPLETED,
          response: {
            request_id: uuid,
            result_type: ResultType.IMAGE,
            completedAt: new Date().toISOString(),
            ...standardResult,
          } as Prisma.InputJsonValue,
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

      await postProcessImageSubTask(updatedSubTask);
      await checkSubTasksAndUpdateTaskStatus(taskId);
      return;
    }

    await handleOpenAINextError(
      new Error("Failed to extract download link"),
      uuid,
      taskId,
      subTaskId
    );
  } catch (error) {
    console.error("Error handling OpenAI Next response:", error);
    await handleOpenAINextError(
      error instanceof Error ? error : new Error("Unknown error"),
      uuid,
      taskId,
      subTaskId
    );
  }
}

async function handleOpenAINextError(
  error: Error,
  uuid: string,
  taskId: string,
  subTaskId: string
) {
  try {
    await prisma.subTask.update({
      where: {
        id: subTaskId,
      },
      data: {
        status: TaskStatus.FAILED,
        response: {
          request_id: uuid,
          error: error.message || "Failed to process OpenAI Next response",
          failedAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
      },
    });
    await checkSubTasksAndUpdateTaskStatus(taskId);
  } catch (dbError) {
    console.error("Error updating SubTask with error status:", dbError);
  }
}
