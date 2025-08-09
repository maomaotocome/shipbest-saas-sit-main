"use client";

import { PlanPeriodFormatText } from "@/components/common/billing/planPeriodText";
import { FeatureType } from "@/db/generated/prisma";
import { Locale } from "@/i18n/locales";
import { FeatureGetPayload, PlanGetPayloadWithDetail } from "@/types/billing";
import { useLocale } from "next-intl";
import { FiCheck, FiX } from "react-icons/fi";
import { Period } from "../PeriodToggle";
import { getFeatureAllocation, getFeatureTranslation, getPlanFeature } from "./utils";

interface FeatureRowProps {
  feature: FeatureGetPayload;
  plans: PlanGetPayloadWithDetail[];
  period: Period;
  isLast: boolean;
}

export default function FeatureRow({ feature, plans, period, isLast }: FeatureRowProps) {
  const locale = useLocale() as Locale;
  const featureTranslation = getFeatureTranslation(feature, locale);

  return (
    <tr className={`border-t border-gray-200 dark:border-gray-900`}>
      <td className={`px-4 py-2`}>
        <div>
          <div className="font-medium">{featureTranslation.name}</div>
          {featureTranslation.description && (
            <div className="text-sm text-gray-500">{featureTranslation.description}</div>
          )}
        </div>
      </td>
      {plans.map((plan) => {
        const planPeriod = plan.planPeriods.find(
          (p) => p.periodType === period.type && p.periodValue == period.value
        );
        if (!planPeriod) return null;
        const planFeature = getPlanFeature(plan, feature.id);
        const className =
          (plan.isPopular ? "bg-primary/10 dark:bg-white/5" : "") +
          " " +
          (isLast ? "rounded-b-lg" : "");

        if (!planFeature || !planFeature.isIncluded) {
          return (
            <td key={plan.id} className={`px-4 py-2 text-center ${className}`}>
              <FiX className="mx-auto h-5 w-5 text-red-500" />
            </td>
          );
        }

        let content;
        if (feature.featureType === FeatureType.CONSUMABLE) {
          const allocation = getFeatureAllocation(plan, feature.id, period);
          content = (
            <div className="text-xl font-bold">
              {allocation ? allocation.quantity : 0}
              {featureTranslation.unit && (
                <span className="ml-1 text-sm">{` ${featureTranslation.unit}`}</span>
              )}
              {planPeriod.resetPeriodType && (
                <div className="bg-primary/10 mx-2 inline rounded-full px-2 py-1 text-sm">
                  <PlanPeriodFormatText
                    type={planPeriod.resetPeriodType}
                    value={planPeriod.resetPeriodValue}
                  />
                </div>
              )}
            </div>
          );
        } else if (planFeature.limit) {
          content = (
            <div className="text-xl font-bold">
              {planFeature.limit}
              {featureTranslation.unit && (
                <span className="ml-1 text-sm">{` ${featureTranslation.unit}`}</span>
              )}
            </div>
          );
        } else {
          content = <FiCheck className="mx-auto h-5 w-5 text-green-500" />;
        }

        return (
          <td key={plan.id} className={`px-4 py-2 text-center ${className}`}>
            {content}
          </td>
        );
      })}
    </tr>
  );
}
