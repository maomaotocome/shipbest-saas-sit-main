"use client";

import { PlanPeriodFormatText } from "@/components/common/billing/planPeriodText";
import { ShineBorder } from "@/components/magicui/shine-border";
import { PlanFeatureRelation, Prisma } from "@/db/generated/prisma";
import { useLocale } from "next-intl";
import OrderButton from "../OrderButton";
import FeatureList from "./feature-list";
import PopularBadge from "./popular-badge";
import PriceDisplay from "./price-display";
import PrimaryFeatureDisplay from "./primary-feature-display";
import { PricingCardProps } from "./types";

export default function PricingCard({ plan, features, planPeriod }: PricingCardProps) {
  const locale = useLocale();
  const getPlanTranslation = (
    plan: Prisma.PlanGetPayload<{
      include: {
        translations: true;
      };
    }>
  ) => {
    return plan.translations.find((t) => t.locale === locale) || plan.translations[0];
  };

  const translation = getPlanTranslation(plan);

  const primaryFeature = plan.planFeatures.find((pf: PlanFeatureRelation) => pf.isPrimary);

  return (
    <div className="relative w-full min-w-90 justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[var(--pricing-card-bg)] to-[var(--pricing-card-bg)/0] shadow-lg transition-transform hover:scale-105 hover:shadow-xl sm:min-w-96 dark:from-[var(--pricing-card-bg-dark)] dark:to-[var(--pricing-card-bg-dark)/0] dark:shadow-white/10">
      {plan.isPopular && (
        <>
          <ShineBorder duration={1} shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
          <PopularBadge />
        </>
      )}

      <div className="relative flex h-full flex-col p-4 sm:p-6">
        <div className="flex-grow">
          <h3 className="mb-1 text-xl font-bold sm:mb-2">
            {translation.nickname}
            <span className="hidden">
              -
              <PlanPeriodFormatText type={planPeriod.periodType} value={planPeriod.periodValue} />
            </span>
          </h3>
          <p className="mb-3 text-gray-600 sm:mb-4 dark:text-gray-400">{translation.subtitle}</p>

          <PriceDisplay planPeriod={planPeriod} />

          <PrimaryFeatureDisplay plan={plan} features={features} planPeriod={planPeriod} />

          <FeatureList
            features={features}
            plan={plan}
            planPeriod={planPeriod}
            primaryFeatureId={primaryFeature?.featureId}
          />
        </div>

        <div className="mt-4 sm:mt-8">
          <OrderButton
            periodType={planPeriod.periodType}
            planId={plan.id}
            periodId={planPeriod.id}
            isPopular={plan.isPopular}
          />
        </div>
      </div>
    </div>
  );
}
