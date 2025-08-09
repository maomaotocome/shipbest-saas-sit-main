import {
  cancelSubscriptionAction,
  getSubscriptionDetail,
  refundPeriodAction,
} from "@/actions/admin/billing/subscriptions/item";
import { getSubscriptionsList } from "@/actions/admin/billing/subscriptions/subscriptions";
import { Prisma } from "@/db/generated/prisma";
import { PaginatedResponse, PaginationParams } from "@/types/pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";

// Types
interface CancelSubscriptionParams {
  subscriptionId: string;
}

interface RefundPeriodParams {
  subscriptionId: string;
  periodId: string;
}

// Define the type for items returned by the paginated action
// This should match SubscriptionListItem from the action file
type SubscriptionListItem = Prisma.SubscriptionGetPayload<{
  include: {
    billingUser: {
      include: {
        user: true;
      };
    };
    periods: true;
    planPeriod: {
      include: {
        plan: {
          include: {
            translations: true;
          };
        };
      };
    };
  };
}>;

// Fetch subscriptions - Updated hook
export const useSubscriptions = (params: PaginationParams) => {
  // Destructure page and pageSize for the query key and function call
  const { page, pageSize } = params;
  // If filters are added later, adjust params type and destructuring
  const filters = {}; // Placeholder for potential future filters

  return useQuery<PaginatedResponse<SubscriptionListItem>>({
    // Expect PaginatedResponse
    // Include page, pageSize, and any filters in the queryKey
    queryKey: ["subscriptions", page, pageSize, filters],
    queryFn: () => getSubscriptionsList({ page, pageSize }), // Pass pagination params
    // keepPreviousData: true, // Optional
  });
};

// Fetch single subscription
export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: ["subscriptions", id],
    queryFn: () => getSubscriptionDetail(id),
    enabled: !!id,
  });
};

// Fetch subscription periods
export const useSubscriptionPeriods = (subscriptionId: string) => {
  return useQuery({
    queryKey: ["subscriptions", subscriptionId, "periods"],
    queryFn: async () => {
      const subscription = await getSubscriptionDetail(subscriptionId);
      if (!subscription) {
        throw new Error("Subscription not found");
      }
      return subscription.periods;
    },
    enabled: !!subscriptionId,
  });
};

// Fetch single period
export const useSubscriptionPeriod = (subscriptionId: string, periodId: string) => {
  return useQuery({
    queryKey: ["subscriptions", subscriptionId, "periods", periodId],
    queryFn: async () => {
      const subscription = await getSubscriptionDetail(subscriptionId);
      const period = subscription?.periods.find((period) => period.id === periodId);
      if (!period) {
        throw new Error("Period not found");
      }
      return period;
    },
    enabled: !!subscriptionId && !!periodId,
  });
};

// Cancel subscription mutation
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("admin.billing.subscriptions");

  return useMutation({
    mutationFn: async ({ subscriptionId }: CancelSubscriptionParams) => {
      return await cancelSubscriptionAction(subscriptionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success(t("cancelSuccess"));
    },
    onError: (error) => {
      console.error("Cancel subscription error:", error);
      toast.error(t("cancelError"));
    },
  });
};

// Refund period mutation
export const useRefundPeriod = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("admin.billing.subscriptions");

  return useMutation({
    mutationFn: async ({ subscriptionId, periodId }: RefundPeriodParams) => {
      return await refundPeriodAction(subscriptionId, periodId);
    },
    onSuccess: (_, { subscriptionId }) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", subscriptionId] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions", subscriptionId, "periods"] });
      toast.success(t("refundSuccess"));
    },
    onError: (error) => {
      console.error("Refund period error:", error);
      toast.error(t("refundError"));
    },
  });
};
