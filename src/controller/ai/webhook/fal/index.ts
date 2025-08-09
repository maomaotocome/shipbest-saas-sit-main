import { ResultType } from "@/conifg/aigc/types";
import { handleFalWebhook } from "@/services/tasks/aigc/providers/fal";
import {
  extractWebhookHeaders,
  verifyWebhookSignature,
} from "@/services/tasks/aigc/providers/fal/webhook-verifier";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string; subTaskId: string; resultType: string }> }
) {
  try {
    const { taskId, subTaskId, resultType } = await params;

    // Get raw request body for signature verification
    const rawBody = Buffer.from(await request.arrayBuffer());

    // Extract verification header information
    const headers = extractWebhookHeaders(request.headers);

    // Check if required headers exist
    if (!headers.isValid) {
      console.error("lost webhook headers");
      return NextResponse.json(
        {
          status: "error",
          message: "lost webhook headers",
        },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isSignatureValid = await verifyWebhookSignature(
      headers.requestId!,
      headers.userId!,
      headers.timestamp!,
      headers.signature!,
      rawBody
    );

    if (!isSignatureValid) {
      console.error("Webhook signature verification failed");
      return NextResponse.json(
        {
          status: "error",
          message: "Signature verification failed",
        },
        { status: 401 }
      );
    }

    // Parse JSON body
    const body = JSON.parse(rawBody.toString("utf-8"));
    console.log("Received verified webhook:", body);

    const result = await handleFalWebhook({
      body,
      taskId,
      subTaskId,
      resultType: resultType as ResultType,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to process webhook",
      },
      { status: 500 }
    );
  }
}
