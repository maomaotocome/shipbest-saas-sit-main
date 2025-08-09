"use client";

import { PlanPeriodFormatText } from "@/components/common/billing/planPeriodText";
import { Locale } from "@/i18n/locales";
import { PlanGetPayloadWithDetail } from "@/types/billing";
import { useLocale, useTranslations } from "next-intl";
import OrderButton from "../OrderButton";
import { Period } from "../PeriodToggle";
import { getPlanTranslation } from "./utils";
interface TableHeaderProps {
  plans: PlanGetPayloadWithDetail[];
  period: Period;
}

export default function TableHeader({ plans, period }: TableHeaderProps) {
  const t = useTranslations("pricing");
  const locale = useLocale() as Locale;
  return (
    <thead>
      <tr className="border-0">
        <th className="px-4 py-3 text-left"></th>
        {plans.map((plan) => {
          const planPeriod = plan.planPeriods.find(
            (p) => p.periodType === period.type && p.periodValue == period.value
          );
          if (!planPeriod) return null;
          const translation = getPlanTranslation(plan, locale);
          return (
            <th
              key={plan.id}
              className={`relative rounded-t-lg px-4 py-3 text-center ${plan.isPopular ? "bg-primary/10 dark:bg-white/5" : ""}`}
            >
              <div className="mb-2 h-6 w-full px-4 py-1 text-center text-lg font-medium">
                {plan.isPopular ? t("popular") : ""}
              </div>

              <div className="flex flex-col items-center">
                <span className="text-lg font-bold">{translation.nickname}</span>
                <span className="text-sm text-gray-500">{translation.subtitle}</span>
              </div>
              <OrderButton
                key={plan.id + "-" + planPeriod.id}
                periodType={planPeriod.periodType}
                planId={plan.id}
                periodId={planPeriod.id}
              />
            </th>
          );
        })}
      </tr>
      <tr className="border-b border-gray-200 dark:border-gray-700">
        <th className="px-4 py-3 text-left">{t("price")}</th>
        {plans.map((plan) => {
          const planPeriod = plan.planPeriods.find(
            (p) => p.periodType === period.type && p.periodValue == period.value
          );
          if (!planPeriod) return null;
          return (
            <th
              key={plan.id}
              className={`px-4 py-3 text-center ${plan.isPopular ? "bg-primary/10 dark:bg-white/5" : ""}`}
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{planPeriod.price / 100}</span>
                <span className="bg-primary/10 mx-2 inline rounded-full px-2 py-1 text-lg text-sm text-gray-500">
                  <PlanPeriodFormatText
                    type={planPeriod.periodType}
                    value={planPeriod.periodValue}
                  />
                </span>
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
