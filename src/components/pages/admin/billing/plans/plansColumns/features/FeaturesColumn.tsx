import { useTranslations } from "next-intl";
import { FeatureBadge } from "./FeatureBadge";
import { FeaturesColumnProps } from "./types";
import { getFeatureAllocations } from "./utils";

export const FeaturesColumn = ({ row, features }: FeaturesColumnProps) => {
  const t = useTranslations("admin.billing.plans");

  if (!row.planFeatures || row.planFeatures.length === 0) {
    return t("noFeaturesDefined");
  }

  return (
    <div className="max-h-32 space-y-1 overflow-y-auto">
      {features.map((feature) => {
        const isIncluded = row.planFeatures.some(
          (planFeature) => planFeature.featureId === feature.id && planFeature.isIncluded
        );
        const isPrimary = row.planFeatures.some(
          (planFeature) => planFeature.featureId === feature.id && planFeature.isPrimary
        );
        const limit =
          feature.featureType !== "CONSUMABLE"
            ? row.planFeatures.find((planFeature) => planFeature.featureId === feature.id)?.limit
            : null;

        const allocations = getFeatureAllocations(feature, row);

        return (
          <FeatureBadge
            key={`${row.id}-${feature.id}`}
            feature={feature}
            isIncluded={isIncluded}
            isPrimary={isPrimary}
            limit={limit}
            allocations={allocations}
          />
        );
      })}
    </div>
  );
};
