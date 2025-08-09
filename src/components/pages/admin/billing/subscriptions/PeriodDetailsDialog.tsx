import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDateI18n } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { useSubscriptionPeriod } from "./hooks";

interface PeriodDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: string;
  periodId: string;
  onRefund: () => void;
}

export default function PeriodDetailsDialog({
  isOpen,
  onClose,
  subscriptionId,
  periodId,
  onRefund,
}: PeriodDetailsDialogProps) {
  const t = useTranslations("admin.billing.subscriptions");
  const locale = useLocale();
  const { data: period, isLoading } = useSubscriptionPeriod(subscriptionId, periodId);

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("periodDetails")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="font-medium">{t("periodNumber")}:</label>
            <div>{period?.periodNumber}</div>
          </div>

          <div>
            <label className="font-medium">{t("startDate")}:</label>
            <div>{period?.startDate ? formatDateI18n(new Date(period.startDate), locale) : ""}</div>
          </div>

          <div>
            <label className="font-medium">{t("endDate")}:</label>
            <div>{period?.endDate ? formatDateI18n(new Date(period.endDate), locale) : ""}</div>
          </div>

          <div>
            <label className="font-medium">{t("status")}:</label>
            <div>{period?.status}</div>
          </div>

          <div className="flex justify-end">
            <Button variant="destructive" onClick={onRefund} disabled={period?.status !== "ACTIVE"}>
              {t("refundPeriod")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
