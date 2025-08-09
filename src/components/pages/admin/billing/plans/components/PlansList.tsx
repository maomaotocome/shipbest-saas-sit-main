import { DataTable } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentProviderAccount } from "@/db/generated/prisma";
import { FeatureGetPayload, PlanGetPayloadWithDetail } from "@/types/billing";
import { PlusIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useColumns } from "../plansColumns";
import { FeaturesModal } from "./FeaturesModal";

interface PlansListProps {
  plans: PlanGetPayloadWithDetail[];
  features: FeatureGetPayload[];
  plansLoading: boolean;
  providers?: PaymentProviderAccount[];
  isLoadingProviders: boolean;
  isSyncing: boolean;
  onAddPlan: () => void;
  onAddFeature: () => void;
  onEditPlan: (id: string) => void;
  onEditFeature: (id: string) => void;
  onSync: (providerId: string) => void;
}

export function PlansList({
  plans,
  features,
  plansLoading,
  providers,
  isLoadingProviders,
  isSyncing,
  onAddPlan,
  onAddFeature,
  onEditPlan,
  onEditFeature,
  onSync,
}: PlansListProps) {
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const t = useTranslations("admin.billing.plans");

  const handleSync = () => {
    if (!selectedProviderId) {
      toast.error(t("selectProviderError"));
      return;
    }

    onSync(selectedProviderId);
    setIsSyncDialogOpen(false);
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-end">
        <div className="flex gap-2">
          <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
            <DialogTrigger asChild>
              <Button>{t("syncToProvider")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("syncPlansDialogTitle")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("selectProvider")}</label>
                  <Select
                    value={selectedProviderId}
                    onValueChange={setSelectedProviderId}
                    disabled={isLoadingProviders}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectProviderPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {providers?.map((provider: PaymentProviderAccount) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleSync}
                  disabled={!selectedProviderId || isSyncing}
                  className="w-full"
                >
                  {isSyncing ? t("syncing") : t("confirmSync")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => setIsFeaturesModalOpen(true)}>{t("manageFeatures")}</Button>
          <Button onClick={onAddPlan}>
            <PlusIcon className="mr-2 h-4 w-4" />
            {t("addPlan")}
          </Button>
        </div>
      </div>

      <DataTable
        columns={useColumns(features || [])}
        data={plans || []}
        loading={plansLoading}
        onEdit={onEditPlan}
      />

      <FeaturesModal
        open={isFeaturesModalOpen}
        onClose={() => setIsFeaturesModalOpen(false)}
        features={features}
        onEditFeature={onEditFeature}
        onAddFeature={onAddFeature}
      />
    </>
  );
}
