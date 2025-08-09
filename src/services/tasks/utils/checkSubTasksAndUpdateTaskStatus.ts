import { TaskStatus } from "@/db/generated/prisma";
import { prisma } from "@/lib/prisma";
import { JsonObject } from "@/types/json";
import { TaskWithoutSystemRequestSelect } from "@/types/tasks";
import { processTaskCreditRefund, shouldProcessRefund } from "../credit";

interface SubTaskForStats {
  id: string;
  status: TaskStatus;
  credits: number | null;
  response: JsonObject | null;
}

interface TaskForResponse {
  response: JsonObject | null;
  subTasks: SubTaskForStats[];
}

export async function checkSubTasksAndUpdateTaskStatus(taskId: string) {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: TaskWithoutSystemRequestSelect,
  });

  if (!task) {
    throw new Error(`Task not found: ${taskId}`);
  }

  const previousStatus = task.status;
  const newStatus = task.subTasks.every((subTask) => subTask.status === TaskStatus.COMPLETED)
    ? TaskStatus.COMPLETED
    : task.subTasks.every((subTask) => subTask.status === TaskStatus.FAILED)
      ? TaskStatus.FAILED
      : task.subTasks.every(
            (subTask) =>
              subTask.status === TaskStatus.COMPLETED || subTask.status === TaskStatus.FAILED
          )
        ? TaskStatus.PARTIALLY_COMPLETED
        : task.status;

  // Calculate task-level statistics and timestamps
  const taskResponse = await buildTaskResponse(task as TaskForResponse, newStatus, previousStatus);

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      status: newStatus,
      response: taskResponse,
    },
  });

  if (previousStatus !== newStatus && shouldProcessRefund(newStatus)) {
    try {
      await processTaskCreditRefund(task);
    } catch (error) {
      console.error(`Process task ${taskId} credit refund failed:`, error);
    }
  }
}

/**
 * Build task-level response with timestamps, statistics, and error information
 */
async function buildTaskResponse(
  task: TaskForResponse,
  newStatus: TaskStatus,
  previousStatus: TaskStatus
): Promise<JsonObject> {
  // Get existing response or create new one
  const existingResponse = (task.response as JsonObject) || {};

  // Calculate statistics
  const totalSubTasks = task.subTasks.length;
  const completedSubTasks = task.subTasks.filter((st) => st.status === TaskStatus.COMPLETED).length;
  const failedSubTasks = task.subTasks.filter((st) => st.status === TaskStatus.FAILED).length;
  const pendingSubTasks = task.subTasks.filter((st) => st.status === TaskStatus.PENDING).length;
  const processingSubTasks = task.subTasks.filter((st) => st.status === TaskStatus.PROCESSING).length;

  // Calculate total credits used
  const totalCreditsUsed = task.subTasks.reduce((sum: number, st) => sum + (st.credits || 0), 0);

  // Get failed subtask IDs and error information
  const failedSubTaskIds = task.subTasks
    .filter((st) => st.status === TaskStatus.FAILED)
    .map((st) => st.id);

  const failedSubTaskErrors = task.subTasks
    .filter((st) => st.status === TaskStatus.FAILED && st.response && typeof st.response === 'object' && st.response.error)
    .map((st) => ({
      subTaskId: st.id,
      error: st.response!.error,
      failedAt: st.response!.failedAt,
    }));

  // Build response object
  const response: JsonObject = {
    ...existingResponse,

    // Statistics
    totalSubTasks,
    completedSubTasks,
    failedSubTasks,
    pendingSubTasks,
    processingSubTasks,
    totalCreditsUsed,
  };

  // Add timestamps based on status changes
  if (newStatus === TaskStatus.COMPLETED && previousStatus !== TaskStatus.COMPLETED) {
    response.completedAt = new Date().toISOString();
    if (existingResponse.startedAt && typeof existingResponse.startedAt === 'string') {
      response.duration = Date.now() - new Date(existingResponse.startedAt).getTime();
    }
  }

  if (newStatus === TaskStatus.FAILED && previousStatus !== TaskStatus.FAILED) {
    response.failedAt = new Date().toISOString();
    if (existingResponse.startedAt && typeof existingResponse.startedAt === 'string') {
      response.duration = Date.now() - new Date(existingResponse.startedAt).getTime();
    }
  }

  if (newStatus === TaskStatus.PARTIALLY_COMPLETED && previousStatus !== TaskStatus.PARTIALLY_COMPLETED) {
    response.partiallyCompletedAt = new Date().toISOString();
    if (existingResponse.startedAt && typeof existingResponse.startedAt === 'string') {
      response.duration = Date.now() - new Date(existingResponse.startedAt).getTime();
    }
  }

  // Add error information for failed tasks
  if (failedSubTaskIds.length > 0) {
    response.failedSubTaskIds = failedSubTaskIds;
    response.errors = failedSubTaskErrors;
    if (failedSubTaskErrors.length > 0) {
      response.errorSummary = `${failedSubTaskErrors.length} subtasks failed: ${failedSubTaskErrors.map((e: { error: unknown }) => e.error).join("; ")}`;
    }
  }

  return response;
}
