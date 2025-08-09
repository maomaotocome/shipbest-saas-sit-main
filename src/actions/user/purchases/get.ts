"use server";

import { getUserPurchases } from "@/db/billing/purchases/getUserPurchases";
import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { PurchaseWithDetail } from "@/types/billing/purchases";
import { PaginatedResponse, PaginationParams } from "@/types/pagination";

export async function getPurchases(
  params: PaginationParams
): Promise<PaginatedResponse<PurchaseWithDetail>> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  try {
    const paginatedPurchases = await getUserPurchases(user.id, params);
    return paginatedPurchases;
  } catch (error) {
    console.error("Error fetching purchases:", error);
    throw new Error("Internal server error");
  }
}
