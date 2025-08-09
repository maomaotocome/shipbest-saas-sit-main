import { ResultType } from "@/conifg/aigc/types";
import { prisma } from "@/lib/prisma";
import { JsonObject } from "@/types/json";
import { handleKieAiWebhook, KieAiWebhookData } from "./webhook-handler";

const KIE_AI_BASE_URL = "https://api.kie.ai";

/**
 * Fetch Veo3 record info from Kie.ai service
 */
async function fetchVeo3RecordInfo(taskId: string, apiKey: string) {
  try {
    const response = await fetch(
      `${KIE_AI_BASE_URL}/api/v1/veo/record-info?taskId=${encodeURIComponent(taskId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      }
    );

    const data = (await response.json()) as JsonObject;

    if (!response.ok) {
      return {
        success: false,
        error: (data.msg as string) || `HTTP ${response.status}: ${response.statusText}`,
        data,
      } as const;
    }

    return {
      success: true,
      data,
    } as const;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    } as const;
  }
}

/**
 * When webhook JSON parsing fails, use the kie_ai_task_id saved in subTask.response to actively query task status
 * and reuse existing handleKieAiWebhook logic for subsequent standardization and persistence processing.
 */
export async function handleKieAiFallbackByTaskRecord({
  subTaskId,
  taskId,
  resultType,
}: {
  subTaskId: string;
  taskId: string;
  resultType: ResultType;
}): Promise<void> {
  try {
    // Read subTask from database and extract kie_ai_task_id
    const subTask = await prisma.subTask.findUnique({
      where: { id: subTaskId },
      select: {
        response: true,
      },
    });

    if (!subTask) {
      console.error("[KieAiFallback] SubTask not found while handling fallback:", subTaskId);
      return;
    }

    const responseData = subTask.response as JsonObject | null;
    const kieAiTaskId = (responseData?.kie_ai_task_id as string) || "";

    if (!kieAiTaskId) {
      console.error("[KieAiFallback] kie_ai_task_id not found in subTask.response", subTaskId);
      return;
    }

    const apiKey = process.env.KIE_AI_API_KEY;
    if (!apiKey) {
      console.warn("[KieAiFallback] KIE_AI_API_KEY is not configured");
      return;
    }

    const fetchResult = await fetchVeo3RecordInfo(kieAiTaskId, apiKey);
    if (!fetchResult.success) {
      console.error("[KieAiFallback] Failed to fetch record info:", fetchResult.error);
      return;
    }

    const recordInfo = fetchResult.data as JsonObject;
    const recordInfoData = recordInfo?.data as JsonObject | undefined;
    if (!recordInfoData) {
      console.error("[KieAiFallback] recordInfo.data missing");
      return;
    }

    const responseObj = recordInfoData.response as JsonObject | undefined;
    const successFlag = responseObj?.successFlag as number | undefined;

    if (successFlag !== 1) {
      console.log(
        `[KieAiFallback] Task ${kieAiTaskId} not completed yet. successFlag=${successFlag}`
      );
      return;
    }

    // Result URL compatible with multiple fields
    const resultUrl =
      (responseObj?.resultUrl as string | undefined) ||
      (responseObj?.result_url as string | undefined) ||
      ((responseObj?.resultUrls as string[] | undefined)?.[0] ?? "");

    // Parse paramJson
    let paramJson: JsonObject = {};
    const paramJsonStr = recordInfoData.paramJson as string | undefined;
    if (paramJsonStr) {
      try {
        paramJson = JSON.parse(paramJsonStr) as JsonObject;
      } catch (err) {
        console.warn("[KieAiFallback] Failed to parse paramJson", err);
      }
    }

    const constructedWebhookData: KieAiWebhookData = {
      code: 200,
      msg: recordInfo.msg as string,
      data: {
        task_id: kieAiTaskId,
        video_url: resultUrl,
        prompt: (paramJson.prompt as string | undefined) ?? null,
        model_name: (paramJson.model_name as string | undefined) ?? null,
        duration: (paramJson.duration as number | undefined) ?? null,
        createTime: (recordInfoData.createTime as string | undefined) ?? null,
        info: {
          resultUrls: resultUrl ? [resultUrl] : [],
        },
      },
    };

    await handleKieAiWebhook({
      subTaskId,
      taskId,
      resultType,
      webhookData: constructedWebhookData,
    });
  } catch (error) {
    console.error("[KieAiFallback] Unexpected error:", error);
  }
}
