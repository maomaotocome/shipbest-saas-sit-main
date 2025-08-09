import { auth } from "@/lib/auth";
import { handleSuggestionsGet } from "@/services/playground/suggestions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("documentId");

  if (!documentId) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await handleSuggestionsGet({ documentId, session });

  if (!result.success) {
    return new Response(result.error, { status: result.error === "Unauthorized" ? 401 : 404 });
  }

  return Response.json(result.suggestions, { status: 200 });
}
