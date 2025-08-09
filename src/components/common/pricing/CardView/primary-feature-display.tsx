import { PlanPeriodFormatText } from "@/components/common/billing/planPeriodText";
import {
  FeatureType,
  PeriodType,
  PlanFeatureRelation,
  PlanPeriodFeatureAllocation,
} from "@/db/generated/prisma";
import { FeatureGetPayload, PlanGetPayloadWithDetail, PlanPeriodGetPayload } from "@/types/billing";

interface PrimaryFeatureDisplayProps {
  plan: PlanGetPayloadWithDetail;
  features: FeatureGetPayload[];
  planPeriod: PlanPeriodGetPayload;
}

export default function PrimaryFeatureDisplay({
  plan,
  features,
  planPeriod,
}: PrimaryFeatureDisplayProps) {
  const primaryFeature = plan.planFeatures.find((pf: PlanFeatureRelation) => pf.isPrimary);
  if (!primaryFeature) return null;

  const feature = features.find((f) => f.id === primaryFeature.featureId);
  if (!feature) return null;

  const featureTranslation = feature.translations[0] || {
    name: feature.code,
    description: "",
    unit: "",
  };
  const allocation = planPeriod.featureAllocations?.find(
    (a: PlanPeriodFeatureAllocation) => a.featureId === feature.id
  );

  const value =
    feature.featureType === FeatureType.CONSUMABLE && allocation
      ? allocation.quantity
      : primaryFeature.limit;

  return (
    <div className="mb-4 text-center sm:mb-6">
      <span className="text-2xl font-bold">{value}</span>
      {featureTranslation.unit && <span className="ml-1 text-lg">{featureTranslation.unit}</span>}
      {feature.featureType === FeatureType.CONSUMABLE && planPeriod.resetPeriodType && (
        <div className="bg-primary/10 mx-2 inline rounded-full px-2 py-1 text-lg">
          <PlanPeriodFormatText
            type={planPeriod.resetPeriodType || PeriodType.DAYS}
            value={planPeriod.resetPeriodValue}
          />
        </div>
      )}
    </div>
  );
}
