import { ResultType } from "@/conifg/aigc/types";
import { handleKieAiFallbackByTaskRecord } from "@/services/tasks/aigc/providers/kie_ai/get-record-info";
import {
  handleKieAiWebhook,
  KieAiWebhookData,
} from "@/services/tasks/aigc/providers/kie_ai/webhook-handler";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string; subTaskId: string; resultType: string }> }
) {
  const { subTaskId, taskId, resultType } = await params;

  // Get raw request body
  const rawBody = Buffer.from(await request.arrayBuffer());
  const rawText = rawBody.toString("utf-8");

  let body: unknown;
  try {
    body = JSON.parse(rawText);
  } catch (parseError) {
    console.warn("Failed to parse Kie.ai webhook JSON, switching to fallback handler", parseError);
    await handleKieAiFallbackByTaskRecord({
      subTaskId,
      taskId,
      resultType: resultType as ResultType,
    });

    return NextResponse.json({
      status: "success",
      message: "Processed via fallback handler due to JSON parse error",
    });
  }

  try {
    console.log("Received kie-ai webhook:", body);

    await handleKieAiWebhook({
      webhookData: body as KieAiWebhookData,
      subTaskId,
      taskId,
      resultType: resultType as ResultType,
    });

    return NextResponse.json({
      status: "success",
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Error processing kie-ai webhook:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to process webhook",
      },
      { status: 500 }
    );
  }
}
