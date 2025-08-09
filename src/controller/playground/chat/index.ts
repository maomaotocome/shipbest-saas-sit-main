import { UIMessage } from "ai";

import { auth } from "@/lib/auth";
import { handleChatDelete, handleChatPost } from "@/services/playground/chat";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      selectedChatModel,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
    } = await request.json();

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const result = await handleChatPost({ id, messages, selectedChatModel, session });

    if (!result.success) {
      return new Response(result.error, { status: result.error === "Unauthorized" ? 401 : 404 });
    }

    return result.response!;
  } catch (error) {
    return new Response(`An error occurred while processing your request! ${error}`, {
      status: 404,
    });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Not Found", { status: 404 });
    }

    const session = await auth();

    if (!session || !session.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const result = await handleChatDelete({ id, session });

    if (!result.success) {
      return new Response(result.error, { status: result.error === "Unauthorized" ? 401 : 404 });
    }

    return new Response(result.message, { status: 200 });
  } catch (error) {
    return new Response(`An error occurred while processing your request! ${error}`, {
      status: 500,
    });
  }
}
