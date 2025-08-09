import { getFeaturesAction } from "@/actions/admin/billing/features/features";
import { getFeatureAction } from "@/actions/admin/billing/features/item";
import { getPlan, updatePlanAction } from "@/actions/admin/billing/plans/item";
import { createPlan, getPlansList } from "@/actions/admin/billing/plans/plans";
import { syncPlansToProvider } from "@/actions/admin/billing/plans/sync-to-provider";
import { getProviders } from "@/actions/admin/billing/providers/providers";
import { type Locale } from "@/i18n/locales";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
const QUERY_KEY = "plans";
const FEATURES_QUERY_KEY = "features";
const PROVIDERS_QUERY_KEY = "providers";

export const usePlans = (locale: Locale = "en", includeInactive: boolean = false) => {
  return useQuery({
    queryKey: [QUERY_KEY, locale, includeInactive],
    queryFn: () => getPlansList(locale, includeInactive),
  });
};

export const useFeatures = (locale: Locale) => {
  return useQuery({
    queryKey: [FEATURES_QUERY_KEY, locale],
    queryFn: () => getFeaturesAction(locale),
  });
};

export const usePlan = (planId: string, locale?: Locale) => {
  return useQuery({
    queryKey: [QUERY_KEY, planId, locale],
    queryFn: () => getPlan(planId, locale),
    enabled: !!planId,
  });
};

export const useFeature = (featureId: string, locale: Locale) => {
  return useQuery({
    queryKey: [FEATURES_QUERY_KEY, featureId, locale],
    queryFn: () => getFeatureAction(featureId, locale),
    enabled: !!featureId,
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("admin.billing.plans");

  return useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(t("createSuccess"));
    },
    onError: (error) => {
      console.error("Create plan error:", error);
      toast.error(t("createError"));
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("admin.billing.plans");

  return useMutation({
    mutationFn: updatePlanAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(t("updateSuccess"));
    },
    onError: (error) => {
      console.error("Update plan error:", error);
      toast.error(t("updateError"));
    },
  });
};

export const usePaymentProviders = () => {
  return useQuery({
    queryKey: [PROVIDERS_QUERY_KEY],
    queryFn: getProviders,
  });
};

export const useSyncPlansToProvider = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("admin.billing.plans");

  return useMutation({
    mutationFn: syncPlansToProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(t("syncSuccess"));
    },
    onError: (error) => {
      console.error("Sync plans error:", error);
      toast.error(t("syncError"));
    },
  });
};
