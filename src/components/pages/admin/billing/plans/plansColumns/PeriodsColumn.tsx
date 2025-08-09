import { PlanPeriodFormatText } from "@/components/common/billing/planPeriodText";
import { Badge } from "@/components/ui/badge";
import { PlanGetPayloadWithDetail } from "@/types/billing";
import { useTranslations } from "next-intl";

export const PeriodsColumn = (row: PlanGetPayloadWithDetail) => {
  const t = useTranslations("admin.billing.plans");

  if (!row.planPeriods || row.planPeriods.length === 0) {
    return t("noPeriodsDefined");
  }

  // Sort periods by sortOrder
  const sortedPeriods = [...row.planPeriods]
    .filter((period) => period.isActive)
    .sort((a, b) => {
      // Check if sortOrder exists on both objects
      if ("sortOrder" in a && "sortOrder" in b) {
        return (a as { sortOrder: number }).sortOrder - (b as { sortOrder: number }).sortOrder;
      }
      // Fallback to default ordering if sortOrder is not available
      return 0;
    });

  return (
    <div className="space-y-1">
      {sortedPeriods.map((period) => {
        const formattedPrice = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: period.currency,
          minimumFractionDigits: 2,
        }).format(period.price / 100);

        return (
          <Badge key={period.id} variant="secondary">
            <PlanPeriodFormatText type={period.periodType} value={period.periodValue} />
            {period.resetPeriodType && period.resetPeriodValue && (
              <>
                {" "}
                ({`${t("resetEvery")}: `}
                <PlanPeriodFormatText
                  type={period.resetPeriodType}
                  value={period.resetPeriodValue}
                />
                )
              </>
            )}
            {" : "}
            {formattedPrice}
          </Badge>
        );
      })}
    </div>
  );
};
