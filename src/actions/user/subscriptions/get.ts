"use server";
import { getUserSubscriptions } from "@/db/billing/subscriptions/getUserSubscriptions";
import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { SubscriptionWithDetail } from "@/types/billing/subscriptions";
import { PaginatedResponse, PaginationParams } from "@/types/pagination";

export async function getSubscriptions(
  params: PaginationParams
): Promise<PaginatedResponse<SubscriptionWithDetail>> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  try {
    const paginatedSubscriptions = await getUserSubscriptions(user.id, params);
    return paginatedSubscriptions;
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw new Error("Failed to fetch subscriptions");
  }
}
