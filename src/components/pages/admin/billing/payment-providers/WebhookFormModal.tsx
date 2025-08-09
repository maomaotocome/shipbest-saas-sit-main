import { registerWebhookAction } from "@/actions/admin/billing/providers/webhook-reg";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentProviderAccount } from "@/db/generated/prisma";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "react-hot-toast";
interface WebhookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: PaymentProviderAccount;
}

export default function WebhookFormModal({ isOpen, onClose, provider }: WebhookFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("admin.billing.payment-providers");
  if (!provider) {
    return null;
  }
  const { code: providerCode, provider: providerName, id: providerId } = provider;

  const webhookUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/billing/paymnet/webhook/${providerName.toLowerCase()}/${providerCode}`;

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      await registerWebhookAction(providerId);
      toast.success(t("webhookRegistered"));
      onClose();
    } catch (error) {
      console.error("Error registering webhook:", error);
      toast.error(t("webhookRegistrationFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("registerWebhook")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="mb-2">{t("webhookRegistrationDescription")}</p>
            <code className="bg-muted block rounded-md p-2 font-mono text-sm break-all">
              {webhookUrl}
            </code>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              {t("cancel")}
            </Button>
            <Button onClick={handleRegister} disabled={isLoading}>
              {isLoading ? t("registering") : t("register")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
