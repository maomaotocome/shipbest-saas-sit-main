"use client";

import { PlanPeriodFormatText } from "@/components/common/billing/planPeriodText";
import { PeriodType } from "@/db/generated/prisma";
export type ViewMode = "card" | "table";

export type Period = {
  type: PeriodType;
  value: number | null;
};

interface PeriodToggleProps {
  periods: Period[];
  selectedPeriod: Period;
  onChange: (period: Period) => void;
  periodFilters?: Period[];
}

export default function PeriodToggle({
  periods,
  selectedPeriod,
  onChange,
  periodFilters,
}: PeriodToggleProps) {
  return (
    <div className="inline-flex rounded-full bg-[var(--toggle-bg)] p-1 shadow-md dark:bg-[var(--toggle-bg-dark)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
      {periods
        .filter(
          (period) => !periodFilters || periodFilters.length === 0 || periodFilters.includes(period)
        )
        .map((period) => {
          const periodKey = `${period.value} ${period.type}`;
          return (
            <button
              key={periodKey}
              className={`rounded-full px-2 py-1 text-xs font-medium transition-colors sm:px-4 sm:py-1.5 sm:text-sm ${
                `${selectedPeriod.value} ${selectedPeriod.type}` === periodKey
                  ? "bg-primary text-white shadow-xs dark:bg-white/80 dark:text-gray-800"
                  : "text-gray-600 hover:bg-[var(--toggle-bg-hover)] hover:text-gray-800 dark:text-gray-400 dark:hover:bg-[var(--toggle-bg-hover-dark)] dark:hover:text-gray-200"
              }`}
              onClick={() => onChange(period)}
            >
              <PlanPeriodFormatText type={period.type} value={period.value} />
            </button>
          );
        })}
    </div>
  );
}
