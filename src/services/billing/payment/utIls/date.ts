import { PeriodType, PlanPeriod } from "@/db/generated/prisma";
import { addDays, addMonths, addWeeks, addYears } from "date-fns";

const addDate = (date: Date, periodType: PeriodType, value: number) => {
  switch (periodType) {
    case PeriodType.DAYS:
      return addDays(date, value);
    case PeriodType.WEEKS:
      return addWeeks(date, value);
    case PeriodType.MONTHS:
      return addMonths(date, value);
    case PeriodType.YEARS:
      return addYears(date, value);
  }
};

export const getResetDate = (date: Date, planPeriod: PlanPeriod) => {
  switch (planPeriod.periodType) {
    case PeriodType.DAYS:
    case PeriodType.WEEKS:
    case PeriodType.MONTHS:
    case PeriodType.YEARS:
    case PeriodType.ONE_TIME:
      return planPeriod.resetPeriodType
        ? addDate(date, planPeriod.resetPeriodType, planPeriod.resetPeriodValue ?? 0)
        : date;
    case PeriodType.LIFETIME:
      return undefined;
    default:
      return date;
  }
};

export const getResetPeriods = (date: Date, planPeriod: PlanPeriod) => {
  if (planPeriod.periodType === PeriodType.LIFETIME) {
    return [];
  }
  if (!planPeriod.resetPeriodType || !planPeriod.resetPeriodValue) {
    return [];
  }
  const periodEndDate = addDate(date, planPeriod.periodType, planPeriod.periodValue ?? 0);
  if (!periodEndDate) {
    return [];
  }
  const resetPeriods = [];
  let i = 0;
  while (true) {
    const startDate = addDate(date, planPeriod.resetPeriodType, i * planPeriod.resetPeriodValue);
    if (!startDate || startDate >= periodEndDate) {
      break;
    }
    let endDate = addDate(date, planPeriod.resetPeriodType, (i + 1) * planPeriod.resetPeriodValue);
    if (!endDate) {
      break;
    }
    if (endDate > periodEndDate) {
      endDate = periodEndDate;
    }
    resetPeriods.push({ startDate, endDate });
    i++;
  }
  return resetPeriods;
};
