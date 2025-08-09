import { FeatureGetPayload, PlanGetPayloadWithDetail, PlanPeriodGetPayload } from "@/types/billing";

export interface PricingCardProps {
  plan: PlanGetPayloadWithDetail;
  features: FeatureGetPayload[];
  planPeriod: PlanPeriodGetPayload;
}

export interface FeatureListProps {
  features: FeatureGetPayload[];
  plan: PlanGetPayloadWithDetail;
  planPeriod: PlanPeriodGetPayload;
  primaryFeatureId?: string;
}

export interface FeatureTranslation {
  name: string;
  description: string;
  unit: string;
}

export interface PlanTranslation {
  nickname: string;
  description: string;
  subtitle: string;
}
