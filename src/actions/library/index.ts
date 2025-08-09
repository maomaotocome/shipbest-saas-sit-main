"use server";

import { getLibraryStats, getUserLibraryObjects, LibraryFilter } from "@/db/library";
import { auth } from "@/lib/auth";

export async function getLibraryObjectsAction(
  filter: LibraryFilter = {},
  page: number = 1,
  limit: number = 20
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await getUserLibraryObjects(session.user.id, filter, page, limit);
}

export async function getLibraryStatsAction() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await getLibraryStats(session.user.id);
}

