import { ModelParameterConfig, ResultType } from "@/conifg/aigc/types";
import { JsonObject } from "@/types/json";
import { fal } from "@fal-ai/client";
import { buildFalRequestForModel } from "./parameter-builder";

export async function submitFalApiTaskWithConfig({
  falModel,
  parameterConfig,
  userInput,
  taskId,
  subTaskId,
  userId,
  resultType,
}: {
  falModel: string;
  parameterConfig: ModelParameterConfig;
  userInput: JsonObject;
  taskId: string;
  subTaskId: string;
  userId: string;
  resultType: ResultType;
}) {
  // build request parameters
  const { requestParams, validation } = await buildFalRequestForModel(
    parameterConfig,
    userInput,
    userId
  );

  // if parameter validation failed, throw error
  if (!validation.valid) {
    throw new Error(`Parameter validation failed: ${validation.errors.join(", ")}`);
  }

  return await submitFalApiTask({
    falModel,
    input: requestParams,
    taskId,
    subTaskId,
    resultType,
  });
}

async function submitFalApiTask({
  falModel,
  input,
  taskId,
  subTaskId,
  resultType,
}: {
  falModel: string;
  input: JsonObject;
  taskId: string;
  subTaskId: string;
  resultType: string;
}) {
  fal.config({
    credentials: process.env.FAL_API_KEY as string,
  });
  const { request_id } = await fal.queue.submit(falModel, {
    input,
    webhookUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/ai/webhook/fal/${taskId}/${subTaskId}/${resultType}`,
  });
  return {
    request_id,
  };
}
