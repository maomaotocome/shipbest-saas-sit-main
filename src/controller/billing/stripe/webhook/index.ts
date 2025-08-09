import { WebhookError } from "@/services/billing/payment/providers/stripe/webhook/errors/WebhookError";
import { StripeWebhookEventHandler } from "@/services/billing/payment/providers/stripe/webhook/eventHandlerRouter";

export async function POST(
  request: Request,
  context: { params: Promise<{ accountCode: string }> }
) {
  try {
    const { accountCode } = await context.params;
    const body = await request.text();
    const signature = request.headers.get("Stripe-Signature") ?? "";

    const handler = await new StripeWebhookEventHandler({ accountCode, signature, rawBody: body });
    await handler.initialize();
    const result = await handler.handleEvent();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook Processing Error:", error);

    if (error instanceof WebhookError) {
      return new Response(
        JSON.stringify({
          error: "WEBHOOK_ERROR",
          message: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "PROCESSING_FAILED",
        message: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
