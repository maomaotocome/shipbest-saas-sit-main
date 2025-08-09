"use client";

import { FeatureGetPayload, PlanGetPayloadWithDetail } from "@/types/billing";
import { Period } from "../PeriodToggle";
import TableBody from "./TableBody";
import TableHeader from "./TableHeader";
import { getNonPrimaryFeatures, getPrimaryFeatures } from "./utils";

interface TableViewProps {
  plans: PlanGetPayloadWithDetail[];
  features: FeatureGetPayload[];
  period: Period;
}

export default function TableView({ plans, features, period }: TableViewProps) {
  const primaryFeatures = getPrimaryFeatures(plans, features);
  const nonPrimaryFeatures = getNonPrimaryFeatures(plans, features);

  return (
    <div className="overflow-x-auto">
      <table className="mt-8 w-full border-collapse">
        <TableHeader plans={plans} period={period} />
        <TableBody
          plans={plans}
          features={features}
          primaryFeatures={primaryFeatures}
          nonPrimaryFeatures={nonPrimaryFeatures}
          period={period}
        />
      </table>
    </div>
  );
}
