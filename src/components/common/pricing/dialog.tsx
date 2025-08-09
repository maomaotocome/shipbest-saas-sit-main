"use client";

import { getPlansData } from "@/actions/billing/plans";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FeatureGetPayload, PlanGetPayloadWithDetail } from "@/types/billing";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ClientPricing from "./Client";

interface PricingDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const PricingDialog = ({ open, onOpenChange }: PricingDialogProps) => {
  const t = useTranslations("pricing");
  const [plans, setPlans] = useState<PlanGetPayloadWithDetail[]>([]);
  const [features, setFeatures] = useState<FeatureGetPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setIsLoading(true);
        const data = await getPlansData();
        setPlans(data.plans);
        setFeatures(data.features);
      } catch (error) {
        console.error("Failed to fetch pricing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchPricingData();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-auto max-h-[80vh] max-w-full overflow-y-auto rounded-none border-none sm:rounded-none">
        <DialogHeader>
          <DialogTitle className="py-2 text-center md:py-8">
            <p className="text-2xl font-bold">{t("dialog.title")}</p>
            <p className="text-muted-foreground text-sm">{t("dialog.description")}</p>
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="text-muted-foreground text-sm">{t("dialog.loading")}</div>
          </div>
        ) : (
          <ClientPricing plans={plans} features={features} view="card" />
        )}
      </DialogContent>
    </Dialog>
  );
};
