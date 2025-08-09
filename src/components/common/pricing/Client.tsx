"use client";
import { useEffect, useState } from "react";

import { PeriodType, PlanPeriod } from "@/db/generated/prisma";
import { useIsMobile } from "@/hooks/use-mobile";
import { FeatureGetPayload, PlanGetPayloadWithDetail } from "@/types/billing";
import CardView from "./CardView";
import PeriodToggle, { Period, ViewMode } from "./PeriodToggle";
import TableView from "./TableView";
import ViewToggle from "./ViewToggle";

interface ClientPricingProps {
  plans: PlanGetPayloadWithDetail[];
  features: FeatureGetPayload[];
  view?: ViewMode | "both";
  periodFilters?: Period[];
}

export default function ClientPricing({
  plans,
  features,
  view = "both",
  periodFilters,
}: ClientPricingProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(view === "both" ? "card" : view);
  const isMobile = useIsMobile();

  const allPeriods: PlanPeriod[] = plans.flatMap((plan) => plan.planPeriods);

  const uniquePeriods = allPeriods
    .reduce((acc, period) => {
      const key = `${period.periodType}-${period.periodValue || 0}`;

      if (!acc.some((p) => `${p.type}-${p.value || 0}` === key)) {
        acc.push({
          type: period.periodType,
          value: period.periodValue,
        });
      }

      return acc;
    }, [] as Period[])
    .sort((a, b) => {
      if (a.type !== b.type) {
        const typeOrder = {
          [PeriodType.DAYS]: 1,
          [PeriodType.MONTHS]: 2,
          [PeriodType.WEEKS]: 3,
          [PeriodType.YEARS]: 4,
          [PeriodType.ONE_TIME]: 5,
          [PeriodType.LIFETIME]: 6,
        };
        return typeOrder[a.type] - typeOrder[b.type];
      }
      return (a.value || 0) - (b.value || 0);
    });

  const defaultPeriod = uniquePeriods.find((p) => p.type === PeriodType.YEARS) || uniquePeriods[0];
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(defaultPeriod);

  useEffect(() => {
    if (uniquePeriods.length > 0) {
      const periodExists = uniquePeriods.some(
        (p) => p.type === selectedPeriod.type && p.value === selectedPeriod.value
      );

      if (!periodExists) {
        setSelectedPeriod({
          type: uniquePeriods[0].type,
          value: uniquePeriods[0].value,
        });
      }
    }
  }, [uniquePeriods, selectedPeriod]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <div className="flex w-full items-center justify-center sm:w-auto">
          <PeriodToggle
            periods={uniquePeriods}
            selectedPeriod={selectedPeriod}
            onChange={setSelectedPeriod}
            periodFilters={periodFilters}
          />
        </div>
        {view === "both" && (
          <div className="hidden sm:block">
            <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          </div>
        )}
      </div>

      {viewMode === "card" || isMobile ? (
        <CardView plans={plans} features={features} period={selectedPeriod} />
      ) : (
        <TableView plans={plans} features={features} period={selectedPeriod} />
      )}
    </div>
  );
}
