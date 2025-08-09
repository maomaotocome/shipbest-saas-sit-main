import { auth } from "@/lib/auth";
import { handleVoteGet, handleVotePatch } from "@/services/playground/vote";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return new Response("chatId is required", { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await handleVoteGet({ chatId, session });

  if (!result.success) {
    return new Response(result.error, { status: result.error === "Unauthorized" ? 401 : 404 });
  }

  return Response.json(result.votes, { status: 200 });
}

export async function PATCH(request: Request) {
  const { chatId, messageId, type }: { chatId: string; messageId: string; type: "up" | "down" } =
    await request.json();

  if (!chatId || !messageId || !type) {
    return new Response("messageId and type are required", { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await handleVotePatch({ chatId, messageId, type, session });

  if (!result.success) {
    return new Response(result.error, { status: result.error === "Unauthorized" ? 401 : 404 });
  }

  return new Response(result.message, { status: 200 });
}
