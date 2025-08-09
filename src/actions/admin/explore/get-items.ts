"use server";

import { getExploreItemsForAdmin } from "@/db/explore/items";
import { ExploreItem, ExploreItemStatus } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";
import { PaginationParams } from "@/types/pagination";

interface GetExploreItemsForAdminParams extends PaginationParams {
  status?: ExploreItemStatus;
  isVisible?: boolean;
  featured?: boolean;
  type?: string;
}

export async function getExploreItemsForAdminAction(
  params: GetExploreItemsForAdminParams
): Promise<ExploreItem[]> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const { page = 1, pageSize = 20, ...filters } = params;
    const result = await getExploreItemsForAdmin({
      ...filters,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    return result;
  } catch (error) {
    console.error("Error fetching explore items for admin:", error);
    throw new Error("Failed to fetch explore items");
  }
}