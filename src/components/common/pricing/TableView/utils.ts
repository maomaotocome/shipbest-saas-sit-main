import { Locale } from "@/i18n/locales";
import { FeatureGetPayload, PlanGetPayloadWithDetail } from "@/types/billing";
import { Period } from "../PeriodToggle";

export const getFeatureTranslation = (feature: FeatureGetPayload, locale: Locale) => {
  return feature.translations.find((t) => t.locale === locale) || feature.translations[0];
};

export const getPlanTranslation = (plan: PlanGetPayloadWithDetail, locale: Locale) => {
  return plan.translations.find((t) => t.locale === locale) || plan.translations[0];
};

export const getFeatureAllocation = (
  plan: PlanGetPayloadWithDetail,
  featureId: string,
  period: Period
) => {
  if (plan.planPeriods.length === 0) return null;

  const planPeriod = plan.planPeriods.find(
    (p) => p.periodType === period.type && p.periodValue == period.value
  );
  if (!planPeriod) return null;
  return planPeriod.featureAllocations.find(
    (allocation: { featureId: string }) => allocation.featureId === featureId
  );
};

export const getPlanFeature = (plan: PlanGetPayloadWithDetail, featureId: string) => {
  return plan.planFeatures.find((pf: { featureId: string }) => pf.featureId === featureId);
};

export const getPrimaryFeatures = (
  plans: PlanGetPayloadWithDetail[],
  features: FeatureGetPayload[]
) => {
  const primaryFeatureIds = new Set<string>();

  plans.forEach((plan) => {
    plan.planFeatures.forEach((pf: { isPrimary: boolean; featureId: string }) => {
      if (pf.isPrimary) {
        primaryFeatureIds.add(pf.featureId);
      }
    });
  });

  return features.filter((f) => primaryFeatureIds.has(f.id));
};

export const getNonPrimaryFeatures = (
  plans: PlanGetPayloadWithDetail[],
  features: FeatureGetPayload[]
) => {
  const primaryFeatureIds = new Set<string>();

  plans.forEach((plan) => {
    plan.planFeatures.forEach((pf: { isPrimary: boolean; featureId: string }) => {
      if (pf.isPrimary) {
        primaryFeatureIds.add(pf.featureId);
      }
    });
  });

  return features.filter((f) => !primaryFeatureIds.has(f.id));
};
