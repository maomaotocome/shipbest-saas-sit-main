"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccountStatus, PaymentProvider } from "@/db/generated/prisma";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useCreateProvider, useProvider, useUpdateProvider } from "./hooks";

interface PaymentProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId?: string;
  onSubmit: () => void;
}

interface FormData {
  name: string;
  provider: PaymentProvider;
  status: AccountStatus;
  priority: number;
  code: string;
  providerSecretKey?: string;
  providerWebhookSecret?: string;
}

const defaultFormData: FormData = {
  name: "",
  provider: PaymentProvider.STRIPE,
  status: AccountStatus.ACTIVE,
  priority: 0,
  code: "",
  providerSecretKey: "",
  providerWebhookSecret: "",
};

export default function PaymentProviderFormModal({
  isOpen,
  onClose,
  providerId,
  onSubmit,
}: PaymentProviderFormModalProps) {
  const t = useTranslations("admin.billing.payment-providers");
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  const { data: provider, isLoading: isLoadingProvider } = useProvider(providerId || "");
  const createMutation = useCreateProvider();
  const updateMutation = useUpdateProvider();

  useEffect(() => {
    if (isOpen) {
      if (provider) {
        setFormData({
          name: provider.name,
          provider: provider.provider,
          status: provider.status,
          priority: provider.priority,
          code: provider.code,
          providerSecretKey: "",
          providerWebhookSecret: "",
        });
      } else {
        setFormData(defaultFormData);
      }
    }
  }, [provider, isOpen]);

  const handleSubmit = async () => {
    try {
      if (providerId) {
        await updateMutation.mutateAsync({
          id: providerId,
          ...formData,
          // Only include secrets if they were changed
          ...(formData.providerSecretKey ? { providerSecretKey: formData.providerSecretKey } : {}),
          ...(formData.providerWebhookSecret
            ? { providerWebhookSecret: formData.providerWebhookSecret }
            : {}),
        });
      } else {
        await createMutation.mutateAsync(formData);
      }

      onSubmit();
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (providerId && isLoadingProvider) {
    return null; // Or loading spinner
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{providerId ? t("editProvider") : t("addProvider")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("form.name")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">{t("form.code")}</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">{t("form.provider")}</Label>
            <Select
              value={formData.provider}
              onValueChange={(value: PaymentProvider) =>
                setFormData((prev) => ({ ...prev, provider: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PaymentProvider).map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t("form.status")}</Label>
            <Select
              value={formData.status}
              onValueChange={(value: AccountStatus) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AccountStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`status.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">{t("form.priority")}</Label>
            <Input
              id="priority"
              type="number"
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priority: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="providerSecretKey">{t("form.secretKey")}</Label>
            <div className="relative">
              <Input
                id="providerSecretKey"
                type={showSecretKey ? "text" : "password"}
                value={formData.providerSecretKey}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    providerSecretKey: e.target.value,
                  }))
                }
                placeholder={providerId ? "••••••••" : ""}
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute top-1/2 right-2 -translate-y-1/2 transform"
              >
                {showSecretKey ? (
                  <EyeOffIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="providerWebhookSecret">{t("form.webhookSecret")}</Label>
            <div className="relative">
              <Input
                id="providerWebhookSecret"
                type={showWebhookSecret ? "text" : "password"}
                value={formData.providerWebhookSecret}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    providerWebhookSecret: e.target.value,
                  }))
                }
                placeholder={providerId ? "••••••••" : ""}
              />
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="absolute top-1/2 right-2 -translate-y-1/2 transform"
              >
                {showWebhookSecret ? (
                  <EyeOffIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("saving") : providerId ? t("update") : t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
