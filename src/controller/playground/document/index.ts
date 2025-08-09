import { ArtifactKind } from "@/components/playground/artifact";
import { auth } from "@/lib/auth";
import {
  handleDocumentGet,
  handleDocumentPatch,
  handleDocumentPost,
} from "@/services/playground/document";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await handleDocumentGet({ id, session });

  if (!result.success) {
    return new Response(result.error, { status: result.error === "Unauthorized" ? 401 : 404 });
  }

  return Response.json(result.document, { status: 200 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { content, title, kind }: { content: string; title: string; kind: ArtifactKind } =
    await request.json();

  const result = await handleDocumentPost({ id, content, title, kind, session });

  if (!result.success) {
    return new Response(result.error, { status: result.error === "Unauthorized" ? 401 : 404 });
  }

  return Response.json(result.document, { status: 200 });
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { timestamp }: { timestamp: string } = await request.json();

  const result = await handleDocumentPatch({ id, timestamp, session });

  if (!result.success) {
    return new Response(result.error, { status: result.error === "Unauthorized" ? 401 : 404 });
  }

  return new Response(result.message, { status: 200 });
}
