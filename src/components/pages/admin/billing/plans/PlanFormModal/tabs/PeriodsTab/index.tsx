import { FeatureType, PeriodType, Prisma } from "@/db/generated/prisma";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toArray } from "../utils";
import { AddPeriodForm } from "./AddPeriodForm";
import { PeriodsTable } from "./PeriodsTable";
import { PeriodsTabProps, PlanPeriodItem } from "./types";
import { generateId } from "./utils";

export default function PeriodsTab({ formData, setFormData, features }: PeriodsTabProps) {
  const t = useTranslations("admin.billing.plans.periodsTab");
  const [newPeriodType, setNewPeriodType] = useState<PeriodType>(PeriodType.MONTHS);
  const [newPeriodValue, setNewPeriodValue] = useState<number>(1);

  const getAllPeriods = () => {
    const updatePeriods = toArray(formData.planPeriods?.update).map((p) => p.data);
    const createPeriods = (formData.planPeriods?.create as PlanPeriodItem[]) || [];
    return [...updatePeriods, ...createPeriods] as PlanPeriodItem[];
  };

  const periods = getAllPeriods();
  const consumableFeatures = features.filter((f) => f.featureType === FeatureType.CONSUMABLE);

  const handleAddPeriod = () => {
    const periodCode =
      `${newPeriodType}-${newPeriodValue}` +
      (newPeriodType !== PeriodType.LIFETIME ? `-RESET-XXXX-XXXX` : "");
    const newPeriod: Prisma.PlanPeriodCreateWithoutPlanInput = {
      id: generateId(),
      periodCode,
      periodType: newPeriodType,
      periodValue: newPeriodValue,
      resetPeriodType: PeriodType.MONTHS,
      resetPeriodValue: 1,
      price: 0,
      currency: "USD",
      isActive: true,
      sortOrder: 0,
      featureAllocations: {
        create: consumableFeatures.map((f) => ({
          featureId: f.id,
          quantity: 0,
        })),
      },
    };

    setFormData((prev) => ({
      ...prev,
      planPeriods: {
        ...prev.planPeriods,
        create: [...(toArray(prev.planPeriods?.create) as PlanPeriodItem[]), newPeriod],
      },
    }));

    setNewPeriodType(PeriodType.MONTHS);
    setNewPeriodValue(1);
  };

  return (
    <div className="mx-auto w-full space-y-4">
      {periods.length === 0 ? (
        <div className="rounded-md border p-4 text-center">
          <h3 className="text-lg font-semibold">{t("noPeriods")}</h3>
        </div>
      ) : (
        <div className="max-w-[80%]">
          <PeriodsTable
            formData={formData}
            setFormData={setFormData}
            allConsumableFeatures={consumableFeatures}
          />
        </div>
      )}

      <AddPeriodForm
        newPeriodType={newPeriodType}
        setNewPeriodType={setNewPeriodType}
        newPeriodValue={newPeriodValue}
        setNewPeriodValue={setNewPeriodValue}
        onAddPeriod={handleAddPeriod}
      />
    </div>
  );
}
