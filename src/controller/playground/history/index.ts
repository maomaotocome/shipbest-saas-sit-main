import { auth } from "@/lib/auth";
import { handleHistoryGet } from "@/services/playground/history";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = parseInt(searchParams.get("limit") || "10");
  const startingAfter = searchParams.get("starting_after");
  const endingBefore = searchParams.get("ending_before");

  const session = await auth();

  if (!session?.user?.id) {
    return Response.json("Unauthorized!", { status: 401 });
  }

  const result = await handleHistoryGet({
    limit,
    startingAfter: startingAfter ? new Date(startingAfter) : undefined,
    endingBefore: endingBefore ? new Date(endingBefore) : undefined,
    session,
  });

  if (!result.success) {
    return Response.json(result.error, { status: 400 });
  }

  return Response.json(result.chats);
}
