import { cancelSubscriptionAction } from "@/actions/user/subscriptions/cancel";
import { getSubscriptions } from "@/actions/user/subscriptions/get";
import { refundSubscriptionPeriod } from "@/actions/user/subscriptions/periodRefund";
import { getSubscriptionPeriods } from "@/actions/user/subscriptions/periods";
import { SubscriptionWithDetail } from "@/types/billing/subscriptions";
import { PaginatedResponse, PaginationParams } from "@/types/pagination";

export async function fetchSubscriptions(
  params: PaginationParams
): Promise<PaginatedResponse<SubscriptionWithDetail>> {
  try {
    const data = await getSubscriptions(params);
    return data;
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return {
      items: [],
      total: 0,
      totalPages: 0,
      page: params.page,
      pageSize: params.pageSize,
    };
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    await cancelSubscriptionAction(subscriptionId);
    return true;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return false;
  }
}

export async function refundPeriod(subscriptionId: string, periodId: string): Promise<boolean> {
  try {
    await refundSubscriptionPeriod(subscriptionId, periodId);
    return true;
  } catch (error) {
    console.error("Error refunding subscription period:", error);
    return false;
  }
}

export async function fetchSubscriptionPeriods(subscriptionId: string) {
  try {
    return await getSubscriptionPeriods(subscriptionId);
  } catch (error) {
    console.error("Error fetching subscription periods:", error);
    return [];
  }
}
