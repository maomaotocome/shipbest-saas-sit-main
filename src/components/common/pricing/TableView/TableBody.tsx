"use client";

import { FeatureGetPayload, PlanGetPayloadWithDetail } from "@/types/billing";
import { Period } from "../PeriodToggle";
import FeatureRow from "./FeatureRow";

interface TableBodyProps {
  plans: PlanGetPayloadWithDetail[];
  features: FeatureGetPayload[];
  primaryFeatures: FeatureGetPayload[];
  nonPrimaryFeatures: FeatureGetPayload[];
  period: Period;
}

export default function TableBody({
  plans,
  primaryFeatures,
  nonPrimaryFeatures,
  period,
}: TableBodyProps) {
  return (
    <tbody>
      {primaryFeatures.length > 0 && (
        <>
          {primaryFeatures.map((feature, index) => (
            <FeatureRow
              key={feature.id}
              feature={feature}
              plans={plans}
              period={period}
              isLast={nonPrimaryFeatures.length == 0 && index === primaryFeatures.length - 1}
            />
          ))}
        </>
      )}

      {nonPrimaryFeatures.length > 0 && (
        <>
          {nonPrimaryFeatures.map((feature, index) => (
            <FeatureRow
              key={feature.id}
              feature={feature}
              plans={plans}
              period={period}
              isLast={index === nonPrimaryFeatures.length - 1}
            />
          ))}
        </>
      )}
    </tbody>
  );
}
