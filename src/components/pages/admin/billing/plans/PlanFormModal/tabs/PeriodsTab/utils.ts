import { PeriodType } from "@/db/generated/prisma";
import { v4 as uuidv4 } from "uuid";

/**
 * Convert a value to an array if it's not already an array
 */
export function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Check if a period type should show a period value
 */
export function shouldShowPeriodValue(periodType: PeriodType): boolean {
  return ["DAYS", "MONTHS", "YEARS"].includes(periodType);
}
