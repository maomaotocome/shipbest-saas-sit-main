"use client";
import { type Locale } from "@/i18n/locales";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { PlansList } from "./components/PlansList";
import { useFeatures, usePaymentProviders, usePlans, useSyncPlansToProvider } from "./hooks";
import PlanFormModal from "./PlanFormModal";

export default function PlansPageClient() {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin.billing.plans");

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  const { data: plans, isLoading: plansLoading, refetch: refetchPlans } = usePlans(locale);
  const { data: features, refetch: refetchFeatures } = useFeatures(locale);
  const { data: providers, isLoading: isLoadingProviders } = usePaymentProviders();
  const { mutate: syncPlans, isPending: isSyncing } = useSyncPlansToProvider();

  const handleAddPlan = () => {
    setPlanModalOpen(true);
  };

  const handleEditPlan = (id: string) => {
    setEditingPlanId(id);
    setPlanModalOpen(true);
  };

  const handleClose = () => {
    setEditingPlanId(null);
    setPlanModalOpen(false);
  };

  const handleSuccess = () => {
    refetchPlans();
    refetchFeatures();
    handleClose();
  };

  const handleSync = (providerId: string) => {
    syncPlans(providerId, {
      onSuccess: () => {
        toast.success(t("syncSuccess"));
      },
      onError: (error) => {
        toast.error(error.message || t("syncError"));
      },
    });
  };

  return (
    <div className="mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      <PlansList
        plans={plans || []}
        features={features || []}
        plansLoading={plansLoading}
        providers={providers}
        isLoadingProviders={isLoadingProviders}
        isSyncing={isSyncing}
        onAddPlan={handleAddPlan}
        onAddFeature={() => {}}
        onEditPlan={handleEditPlan}
        onEditFeature={() => {}}
        onSync={handleSync}
      />

      <PlanFormModal
        isOpen={planModalOpen}
        onClose={handleClose}
        planId={editingPlanId || undefined}
        onSubmit={handleSuccess}
      />
    </div>
  );
}
