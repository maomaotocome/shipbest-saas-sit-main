"use client";

import { PlanPeriodFormatText } from "@/components/common/billing/planPeriodText";
import {
  FeatureType,
  PlanFeatureRelation,
  PlanPeriodFeatureAllocation,
  Prisma,
} from "@/db/generated/prisma";
import { useLocale } from "next-intl";
import { FiCheck, FiX } from "react-icons/fi";
import { FeatureListProps } from "./types";

export default function FeatureList({
  features,
  plan,
  planPeriod,
  primaryFeatureId,
}: FeatureListProps) {
  const locale = useLocale();
  const getFeatureTranslation = (
    feature: Prisma.FeatureGetPayload<{
      include: {
        translations: true;
      };
    }>
  ) => {
    return feature.translations.find((t) => t.locale === locale) || feature.translations[0];
  };
  const getFeatureAllocation = (featureId: string) => {
    return planPeriod.featureAllocations?.find(
      (allocation: PlanPeriodFeatureAllocation) => allocation.featureId === featureId
    );
  };

  const getPlanFeature = (featureId: string) => {
    return plan.planFeatures.find((pf: PlanFeatureRelation) => pf.featureId === featureId);
  };

  return (
    <div className="mt-4 space-y-2 font-light text-gray-600 sm:mt-6 sm:space-y-3 dark:text-gray-400">
      {features.map((feature) => {
        const featureTranslation = getFeatureTranslation(feature);
        const planFeature = getPlanFeature(feature.id);

        if (primaryFeatureId === feature.id || !planFeature) {
          return null;
        }

        if (!planFeature.isIncluded) {
          return (
            <div key={feature.id} className="flex items-center text-gray-500">
              <FiX className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-sm">{featureTranslation.name}</span>
            </div>
          );
        }

        let content;
        if (feature.featureType === FeatureType.AVAILABILITY) {
          content = (
            <div key={feature.id} className="flex items-center">
              <FiCheck className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-sm">{featureTranslation.name}</span>
            </div>
          );
        } else if (feature.featureType === FeatureType.ALLOCATABLE && planFeature.limit) {
          content = (
            <div key={feature.id} className="flex items-center">
              <FiCheck className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-sm">
                {featureTranslation.name}: {planFeature.limit}
                {featureTranslation.unit && ` ${featureTranslation.unit}`}
              </span>
            </div>
          );
        } else if (feature.featureType === FeatureType.CONSUMABLE) {
          const allocation = getFeatureAllocation(feature.id);
          content = (
            <div key={feature.id} className="flex items-center">
              <FiCheck className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-sm">
                {featureTranslation.name}: {allocation ? allocation.quantity : 0}
                {featureTranslation.unit && ` ${featureTranslation.unit}`}
                {planPeriod.resetPeriodType && (
                  <div className="bg-primary/10 mx-2 inline rounded-full px-2 py-1 text-sm">
                    <PlanPeriodFormatText
                      type={planPeriod.resetPeriodType}
                      value={planPeriod.resetPeriodValue}
                    />
                  </div>
                )}
              </span>
            </div>
          );
        }

        return content;
      })}
    </div>
  );
}
