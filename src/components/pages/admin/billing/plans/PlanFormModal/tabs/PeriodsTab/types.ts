import { PeriodType, Prisma } from "@/db/generated/prisma";
import { FeatureGetPayload } from "@/types/billing";

export interface PeriodsTabProps {
  formData: Prisma.PlanUpdateInput;
  setFormData: React.Dispatch<React.SetStateAction<Prisma.PlanUpdateInput>>;
  features: FeatureGetPayload[];
}

export interface PeriodsTableProps {
  formData: Prisma.PlanUpdateInput;
  allConsumableFeatures: FeatureGetPayload[];
  setFormData: React.Dispatch<React.SetStateAction<Prisma.PlanUpdateInput>>;
}

export interface AddPeriodFormProps {
  newPeriodType: PeriodType;
  setNewPeriodType: React.Dispatch<React.SetStateAction<PeriodType>>;
  newPeriodValue: number;
  setNewPeriodValue: React.Dispatch<React.SetStateAction<number>>;
  onAddPeriod: () => void;
}

export type PlanPeriodItem = Prisma.PlanPeriodCreateWithoutPlanInput;
export type PlanFeatureRelationItem = Prisma.PlanFeatureRelationUncheckedCreateWithoutPlanInput;
export type PlanPeriodFeatureAllocationItem =
  Prisma.PlanPeriodFeatureAllocationUncheckedCreateWithoutPlanPeriodInput;
