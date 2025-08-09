import { PlanPeriodFormatText } from "@/components/common/billing/planPeriodText";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { FeatureBadgeProps } from "./types";

const renderConsumableFeature = (
  feature: FeatureBadgeProps["feature"],
  allocations: FeatureBadgeProps["allocations"],
  t: ReturnType<typeof useTranslations>
) => {
  const featureUnit = feature.translations?.[0]?.unit;
  return (
    <>
      <p className="mt-2 text-sm font-medium">{t("allocationsByPeriod")}</p>
      {allocations.map((alloc, idx) => (
        <div key={idx} className="flex justify-between text-sm">
          <span>
            <span>
              <PlanPeriodFormatText type={alloc.periodType} value={alloc.periodValue} />
            </span>
          </span>
          <span>
            {alloc.resetPeriodType && alloc.resetPeriodValue && (
              <>
                {alloc.quantity !== null ? alloc.quantity : t("unlimited")}
                {featureUnit && ` ${featureUnit}`}
                /
                <PlanPeriodFormatText type={alloc.resetPeriodType} value={alloc.resetPeriodValue} />
              </>
            )}
          </span>
        </div>
      ))}
    </>
  );
};

const renderNonConsumableFeature = (
  feature: FeatureBadgeProps["feature"],
  limit: FeatureBadgeProps["limit"],
  t: ReturnType<typeof useTranslations>
) => {
  const featureUnit = feature.translations?.[0]?.unit;
  return (
    <div className="mt-2 text-sm">
      {t("limitLabel")}: {limit} {featureUnit || ""}
    </div>
  );
};

const renderBasicFeature = (isIncluded: boolean, t: ReturnType<typeof useTranslations>) => {
  return (
    <div className="mt-2 text-sm">{isIncluded ? t("featuresTab.included") : t("notIncluded")}</div>
  );
};

export const FeatureBadge = ({
  feature,
  isIncluded,
  isPrimary,
  limit,
  allocations,
}: FeatureBadgeProps) => {
  const t = useTranslations("admin.billing.plans");

  const featureName = feature.translations?.[0]?.name || feature.code;
  const featureUnit = feature.translations?.[0]?.unit;
  const isConsumable = feature.featureType === "CONSUMABLE";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={isIncluded ? "outline" : "secondary"}
            className={`${isPrimary ? "border-green-500" : ""} cursor-help`}
          >
            {featureName}
            {!isConsumable && limit !== null && `: ${limit}`}
            {!isConsumable && featureUnit && ` ${featureUnit}`}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="w-64 p-2">
          <div className="space-y-2">
            <p className="font-medium">{featureName}</p>
            <p className="text-sm text-gray-500">{feature.translations?.[0]?.description}</p>

            {isIncluded && isConsumable && allocations.length > 0
              ? renderConsumableFeature(feature, allocations, t)
              : isIncluded && !isConsumable && limit !== null
                ? renderNonConsumableFeature(feature, limit, t)
                : renderBasicFeature(isIncluded, t)}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
