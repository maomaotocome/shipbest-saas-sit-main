"use client";

import { FeatureGetPayload, PlanGetPayloadWithDetail } from "@/types/billing";
import { Period } from "../PeriodToggle";
import PricingCard from "./pricing-card";
interface CardViewProps {
  plans: PlanGetPayloadWithDetail[];
  features: FeatureGetPayload[];
  period: Period;
}

export default function CardView({ plans, features, period }: CardViewProps) {
  return (
    <div className="flex w-full justify-center py-10">
      <div className="flex w-full max-w-7xl flex-wrap justify-center gap-6 px-4">
        {plans.map((plan) => {
          const planPeriod = plan.planPeriods.map((p) => (
            <div
              key={p.id}
              className={`${p.periodType === period.type && p.periodValue === period.value ? "" : "hidden"}`}
            >
              <PricingCard key={plan.id} plan={plan} features={features} planPeriod={p} />
            </div>
          ));
          return planPeriod;
        })}
      </div>
    </div>
  );
}
