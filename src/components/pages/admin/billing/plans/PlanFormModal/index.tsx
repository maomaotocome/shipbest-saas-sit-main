import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prisma } from "@/db/generated/prisma";
import { type Locale } from "@/i18n/locales";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import FeaturesTab from "./tabs/FeaturesTab";
import GeneralTab from "./tabs/GeneralTab";
import PeriodsTab from "./tabs/PeriodsTab";
import TranslationsTab from "./tabs/TranslationsTab";

import { useLocale, useTranslations } from "next-intl";
import { useFeatures, usePlan } from "../hooks";
import { useCreatePlan, useUpdatePlan } from "./hooks";
import { convertToUpadteData, defaultPlanForm } from "./types";

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId?: string;
  onSubmit: () => void;
}

export default function PlanFormModal({ isOpen, onClose, planId, onSubmit }: PlanFormModalProps) {
  const t = useTranslations("admin.billing.plans");
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<Prisma.PlanUpdateInput>(defaultPlanForm);
  const locale = useLocale() as Locale;
  const { data: features } = useFeatures(locale);
  const { data: plan, isLoading: planLoading } = usePlan(planId || "");

  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan(planId || "");

  const isSubmitting = createPlanMutation.isPending || updatePlanMutation.isPending;

  useEffect(() => {
    if (plan && !isSubmitting) {
      const formdata = convertToUpadteData(plan);
      setFormData(formdata);
    } else if (!planId) {
      setFormData(defaultPlanForm);
    }
  }, [plan, planId, locale, isSubmitting]);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("general");
      if (!planId) {
        setFormData(defaultPlanForm);
      }
    }
  }, [isOpen, planId]);

  const handleSubmit = async () => {
    try {
      if (planId) {
        await updatePlanMutation.mutateAsync(formData);
        toast.success(t("updateSuccess"));
      } else {
        await createPlanMutation.mutateAsync(formData as Prisma.PlanCreateInput);
        toast.success(t("createSuccess"));
      }

      onSubmit();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("saveError"));
    }
  };

  const updateField = (field: string, value: string | number | boolean | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-7xl max-w-[90vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {planId
              ? `${t("editPlan")}${formData.code ? ` - ${formData.code}` : ""}`
              : t("createNewPlan")}
          </DialogTitle>
        </DialogHeader>
        {planLoading ? (
          <div className="flex h-full items-center justify-center">Loading...</div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="mb-4 grid grid-cols-4">
                <TabsTrigger value="general">{t("general")}</TabsTrigger>
                <TabsTrigger value="translations">{t("translations")}</TabsTrigger>
                <TabsTrigger value="features">{t("features")}</TabsTrigger>
                <TabsTrigger value="periods">{t("periods")}</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <GeneralTab formData={formData} updateField={updateField} isEdit={!!planId} />
              </TabsContent>

              <TabsContent value="translations">
                <TranslationsTab formData={formData} setFormData={setFormData} locale={locale} />
              </TabsContent>

              <TabsContent value="features">
                <FeaturesTab
                  formData={formData}
                  setFormData={setFormData}
                  features={features || []}
                />
              </TabsContent>

              <TabsContent value="periods">
                <PeriodsTab
                  formData={formData}
                  setFormData={setFormData}
                  features={features || []}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={onClose}>
                {t("cancel")}
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? t("saving") : planId ? t("update") : t("create")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
