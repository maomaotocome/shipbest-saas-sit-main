import { Badge } from "@/components/ui/badge";
import { formatDateI18n } from "@/lib/utils";
import { FeatureGetPayload, PlanGetPayloadWithDetail } from "@/types/billing";
import { useLocale, useTranslations } from "next-intl";
import { FeaturesColumn } from "./features/FeaturesColumn";
import { NameColumn } from "./NameColumn";
import { PeriodsColumn } from "./PeriodsColumn";

export const useColumns = (features: FeatureGetPayload[]) => {
  const locale = useLocale();

  const t = useTranslations("admin.billing.plans");

  return [
    {
      header: t("headers.code"),
      accessorKey: "code",
    },
    {
      header: t("headers.name"),
      accessorKey: "translations",
      cell: (row: PlanGetPayloadWithDetail) => <NameColumn {...row} />,
    },
    {
      header: t("headers.status"),
      accessorKey: "status",
      cell: (row: PlanGetPayloadWithDetail) => (
        <Badge variant={row.status === "ACTIVE" ? "outline" : "secondary"}>
          {t(`generalTab.PlanStatus.${row.status.toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      header: t("headers.billingScheme"),
      accessorKey: "billingScheme",
      cell: (row: PlanGetPayloadWithDetail) => (
        <Badge variant="outline">
          {t(`generalTab.BillingScheme.${row.billingScheme.toLowerCase().replace(/_/g, "")}`)}
        </Badge>
      ),
    },
    {
      header: t("headers.features"),
      accessorKey: "planFeatures",
      cell: (row: PlanGetPayloadWithDetail) => <FeaturesColumn row={row} features={features} />,
    },
    {
      header: t("headers.periods"),
      accessorKey: "planPeriods",
      cell: (row: PlanGetPayloadWithDetail) => <PeriodsColumn {...row} />,
    },
    {
      header: t("headers.validFrom"),
      accessorKey: "validFrom",
      cell: (row: PlanGetPayloadWithDetail) =>
        row.validFrom ? formatDateI18n(row.validFrom, locale) : "-",
    },
    {
      header: t("headers.validUntil"),
      accessorKey: "validUntil",
      cell: (row: PlanGetPayloadWithDetail) =>
        row.validUntil ? formatDateI18n(row.validUntil, locale) : "-",
    },
  ];
};
