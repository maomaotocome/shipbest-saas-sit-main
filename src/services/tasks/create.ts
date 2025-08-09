// Define request type as a recursive JSON-like structure

import { Provider } from "@/conifg/aigc/types";
import { getOrCreateBillingUserByUserId } from "@/db/billing/users";
import { Prisma } from "@/db/generated/prisma";
import { TaskType } from "@/lib/constants";
import type { JsonObject } from "@/types/json";
import { cancelCreditReverse } from "../billing/credits/reverse/cancel";
import { confirmCreditReverse } from "../billing/credits/reverse/confirm";
import { reverseCredit } from "../billing/credits/reverse/create";
import { hasValidPrivateTaskPermission } from "../billing/utils/permission";
import { createFalTask } from "./aigc/providers/fal";
import { createKieAiTask } from "./aigc/providers/kie_ai";
import { createOpenAINextTask } from "./aigc/providers/openai-next";
import { getSystemRequest } from "./aigc/utils/get-system-request";
import { getTaskProvider } from "./aigc/utils/get-task-provider";
import { calculateTaskCredits } from "./credit";
import { runTask } from "./run";

interface CreateTaskParams {
  taskType: string;
  request: JsonObject;
  userId: string;
  isPublic: boolean;
  metadata: JsonObject;
}

export async function createAndRunTask(params: CreateTaskParams): Promise<TaskCreationResult> {
  // Validate task type
  const taskType = params.taskType as TaskType;
  if (!Object.values(TaskType).includes(taskType)) {
    throw new Error(`Unsupported task type: ${params.taskType}`);
  }

  const systemRequest = await getSystemRequest({ taskType, metadata: params.metadata });

  const requireCredits = await calculateTaskCredits({
    taskType,
    metadata: params.metadata,
    request: params.request,
    systemRequest,
  });
  const billingUser = await getOrCreateBillingUserByUserId({ userId: params.userId });
  const privateTaskPermission = await hasValidPrivateTaskPermission(params.userId);

  // Create task using provider-based approach
  const task = await createTaskByTaskType({
    taskType,
    request: params.request,
    systemRequest,
    userId: params.userId,
    isPublic: params.isPublic || !privateTaskPermission,
    metadata: params.metadata,
  });

  const creditTransaction = await reverseCredit({
    billingUserId: billingUser.id,
    credit: requireCredits.totalCredits,
    taskId: task.id,
  });

  runTask(task)
    .then(async () => {
      if (creditTransaction.id) {
        await confirmCreditReverse({ creditTransactionId: creditTransaction.id });
      }
    })
    .catch(async (error) => {
      console.error("Failed to run task:", error);
      if (creditTransaction.id) {
        try {
          await cancelCreditReverse({ creditTransactionId: creditTransaction.id });
        } catch (cancelError) {
          console.error("Failed to cancel credit reserve:", cancelError);
        }
      }
    });

  return task;
}

export type TaskCreationResult = Prisma.TaskGetPayload<{
  include: {
    subTasks: true;
  };
}>;

export async function createTaskByTaskType({
  taskType,
  request,
  systemRequest,
  userId,
  isPublic = false,
  metadata,
}: {
  taskType: TaskType;
  request: JsonObject;
  systemRequest: JsonObject;
  userId: string;
  isPublic: boolean;
  metadata: JsonObject;
}): Promise<TaskCreationResult> {
  switch (taskType) {
    case TaskType.ModelDirectInvocation:
      return await createModelDirectInvocationTask({
        taskType,
        request,
        systemRequest,
        userId,
        isPublic,
        metadata,
      });
    case TaskType.Template:
      return await createTemplateTask({
        taskType,
        request,
        systemRequest,
        userId,
        isPublic,
        metadata,
      });
    default:
      throw new Error(`Unsupported task type: ${taskType}`);
  }
}
export async function createModelDirectInvocationTask({
  taskType,
  request,
  systemRequest,
  userId,
  isPublic = false,
  metadata,
}: {
  taskType: TaskType;
  request: JsonObject;
  systemRequest: JsonObject;
  userId: string;
  isPublic: boolean;
  metadata: JsonObject;
}): Promise<TaskCreationResult> {
  const provider = await getTaskProvider({
    metadata,
    taskType,
    request,
    systemRequest,
  });

  switch (provider) {
    case Provider.fal:
      return await createFalTask({ taskType, request, systemRequest, userId, isPublic, metadata });

    case Provider.kie_ai:
      return await createKieAiTask({
        taskType,
        request,
        systemRequest,
        userId,
        isPublic,
        metadata,
      });

    case Provider.openai_next:
      return await createOpenAINextTask({
        taskType,
        request,
        systemRequest,
        userId,
        isPublic,
        metadata,
      });

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
export async function createTemplateTask({
  taskType,
  request,
  systemRequest,
  userId,
  isPublic = false,
  metadata,
}: {
  taskType: TaskType;
  request: JsonObject;
  systemRequest: JsonObject;
  userId: string;
  isPublic: boolean;
  metadata: JsonObject;
}): Promise<TaskCreationResult> {
  const provider = await getTaskProvider({
    metadata,
    taskType,
    request,
    systemRequest,
  });

  switch (provider) {
    case Provider.fal:
      return await createFalTask({ taskType, request, systemRequest, userId, isPublic, metadata });

    case Provider.openai_next:
      return await createOpenAINextTask({
        taskType,
        request,
        systemRequest,
        userId,
        isPublic,
        metadata,
      });

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
