import { PeriodType } from "@/db/generated/prisma";
import { FeatureGetPayload, PlanGetPayloadWithDetail } from "@/types/billing";

export interface FeaturesColumnProps {
  row: PlanGetPayloadWithDetail;
  features: FeatureGetPayload[];
}

export interface FeatureAllocation {
  periodType: PeriodType;
  periodValue: number;
  quantity: number;
  currency: string;
  resetPeriodType?: PeriodType;
  resetPeriodValue?: number;
}

export interface FeatureBadgeProps {
  feature: FeatureGetPayload;
  isIncluded: boolean;
  isPrimary: boolean;
  limit: number | null | undefined;
  allocations: FeatureAllocation[];
}
