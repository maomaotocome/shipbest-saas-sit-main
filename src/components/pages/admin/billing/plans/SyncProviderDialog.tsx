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
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface Props {
  providers: PaymentProviderAccount[] | undefined;
  isLoadingProviders: boolean;
  onSync: (providerId: string) => void;
  isSyncing: boolean;
}

export default function SyncProviderDialog({
  providers,
  isLoadingProviders,
  onSync,
  isSyncing,
}: Props) {
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const t = useTranslations("admin.billing.plans");

  const handleSync = () => {
    if (!selectedProviderId) {
      toast.error(t("selectProviderError"));
      return;
    }

    onSync(selectedProviderId);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                {providers?.map((provider) => (
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
  );
}
