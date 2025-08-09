import { PlanPeriodFormatText } from "@/components/common/billing/planPeriodText";
import { PlanPeriodGetPayload } from "@/types/billing";
interface PriceDisplayProps {
  planPeriod: PlanPeriodGetPayload;
}

export default function PriceDisplay({ planPeriod }: PriceDisplayProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <span className="text-3xl font-bold">{String(planPeriod.price / 100)}</span>
      <span className="ml-1 text-gray-500">{planPeriod.currency}</span>
      <div className="bg-primary/10 mx-2 inline rounded-full px-2 py-1 text-lg">
        <PlanPeriodFormatText type={planPeriod.periodType} value={planPeriod.periodValue} />
      </div>
    </div>
  );
}
