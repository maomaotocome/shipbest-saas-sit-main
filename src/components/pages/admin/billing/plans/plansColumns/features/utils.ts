import { FeatureGetPayload, PlanGetPayloadWithDetail } from "@/types/billing";
import { FeatureAllocation } from "./types";

export const getFeatureAllocations = (
  feature: FeatureGetPayload,
  row: PlanGetPayloadWithDetail
): FeatureAllocation[] => {
  if (feature.featureType !== "CONSUMABLE" || !row.planPeriods) {
    return [];
  }

  return row.planPeriods
    .filter((period) => period.isActive)
    .flatMap((period) => {
      const allocation = period.featureAllocations.find((alloc) => alloc.featureId === feature.id);

      if (!allocation) return [];

      return [
        {
          periodType: period.periodType,
          periodValue: period.periodValue ?? -1,
          quantity: allocation.quantity,
          currency: period.currency,
          resetPeriodType: period.resetPeriodType ?? undefined,
          resetPeriodValue: period.resetPeriodValue ?? undefined,
        },
      ];
    });
};
