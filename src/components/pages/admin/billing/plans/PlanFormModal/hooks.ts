import { updatePlanAction } from "@/actions/admin/billing/plans/item";
import { createPlan } from "@/actions/admin/billing/plans/plans";
import { syncPlansToProvider } from "@/actions/admin/billing/plans/sync-to-provider";
import { Prisma } from "@/db/generated/prisma";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planData: Prisma.PlanCreateInput) => {
      const result = await createPlan(planData);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}

export function useUpdatePlan(planId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planData: Prisma.PlanUpdateInput) => {
      const result = await updatePlanAction(planData);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: ["plans", planId] });
    },
  });
}

export function useSyncPlansToProvider(providerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await syncPlansToProvider(providerId);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}
