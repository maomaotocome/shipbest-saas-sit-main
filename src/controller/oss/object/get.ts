import { Role } from "@/db/generated/prisma";
import { getUser } from "@/lib/auth/utils";
import { getViewInfo } from "@/services/oss/objects/getViewInfo";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ objectId: string }> }
) {
  const { objectId } = await params;
  const user = await getUser();
  try {
    const object = await getViewInfo({
      objectId,
      userId: user?.id || "",
      isAdmin: user?.role === Role.ADMIN,
    });
    return NextResponse.redirect(object.url, 302);
  } catch {
    return new Response("Object not found", { status: 404 });
  }
}
