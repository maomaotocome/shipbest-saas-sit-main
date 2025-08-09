import { PeriodType } from "@/db/generated/prisma";
import { useTranslations } from "next-intl";

export function PlanPeriodText({ type }: { type: PeriodType }): React.ReactNode {
  const t = useTranslations("plans.periodType");
  switch (type) {
    case PeriodType.DAYS:
      return t("days");
    case PeriodType.WEEKS:
      return t("weeks");
    case PeriodType.MONTHS:
      return t("months");
    case PeriodType.YEARS:
      return t("years");
    case PeriodType.ONE_TIME:
      return t("oneTime");
    case PeriodType.LIFETIME:
      return t("lifetime");
  }
}

export function PlanPeriodFormatText({
  type,
  value,
}: {
  type: PeriodType;
  value: number | null;
}): React.ReactNode {
  const t = useTranslations("plans.periodFormat");

  switch (type) {
    case PeriodType.DAYS:
      return value && value > 1 ? t("days", { value }) : t("day", { value: value ?? 0 });
    case PeriodType.WEEKS:
      return value && value > 1 ? t("weeks", { value }) : t("week", { value: value ?? 0 });
    case PeriodType.MONTHS:
      return value && value > 1 ? t("months", { value }) : t("month", { value: value ?? 0 });
    case PeriodType.YEARS:
      return value && value > 1 ? t("years", { value }) : t("year", { value: value ?? 0 });
    case PeriodType.ONE_TIME:
      return t("oneTime");
    case PeriodType.LIFETIME:
      return t("lifetime");
  }
}
