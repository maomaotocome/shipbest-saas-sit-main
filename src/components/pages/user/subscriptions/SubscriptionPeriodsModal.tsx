import { DataTable } from "@/components/common/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SubscriptionPeriod } from "@/db/generated/prisma";
import { formatDateI18n, translateEnum } from "@/lib/utils";
import { SubscriptionWithDetail } from "@/types/billing/subscriptions";
import { useLocale, useTranslations } from "next-intl";

interface SubscriptionPeriodsModalProps {
  subscription: SubscriptionWithDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionPeriodsModal({
  subscription,
  open,
  onOpenChange,
}: SubscriptionPeriodsModalProps) {
  const t = useTranslations("user.subscriptions");
  const locale = useLocale();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("subscriptionPeriods")}</DialogTitle>
        </DialogHeader>
        {subscription && (
          <DataTable
            columns={[
              {
                header: t("periodNumber"),
                accessorKey: "periodNumber",
              },
              {
                header: t("startDate"),
                accessorKey: "startDate",
                cell: (row: SubscriptionPeriod) => formatDateI18n(new Date(row.startDate), locale),
              },
              {
                header: t("endDate"),
                accessorKey: "endDate",
                cell: (row: SubscriptionPeriod) => formatDateI18n(new Date(row.endDate), locale),
              },
              {
                header: t("status"),
                accessorKey: "status",
                cell: (row: SubscriptionPeriod) =>
                  translateEnum(t, "subscriptionPeriodStatus", row.status),
              },
            ]}
            data={subscription.periods}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
