import { getDateFnsLocaleMap } from "@/i18n/config";
import { defaultLocale, Locale } from "@/i18n/locales";
import { PaginatedResponse, PaginationParams } from "@/types/pagination";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUUID(): string {
  return uuidv4();
}

// More specific type for Prisma count arguments (typically subset of FindManyArgs)
// We focus on 'where' as it's the most common argument needed for count.
// If other args like 'cursor', 'orderBy', 'distinct' are needed for count, this type needs expansion.
type PrismaCountArgs = { where?: object | null | undefined };

// More specific type for Prisma findMany arguments
// Allow object, null, or undefined for relational fields
type PrismaFindManyArgs = {
  where?: object | null | undefined;
  include?: object | null | undefined;
  select?: object | null | undefined;
  orderBy?: object | object[] | null | undefined;
};

// Generic type for a Prisma model delegate's relevant methods
// TCountArgs: Type for count arguments (e.g., Prisma.UserCountArgs)
// TFindArgs: Type for findMany arguments (e.g., Prisma.UserFindManyArgs)
// TItem: The type of the items returned by findMany (e.g., User)
type ModelDelegate<
  TCountArgs extends PrismaCountArgs,
  TFindArgs extends PrismaFindManyArgs,
  TItem,
> = {
  count: (args?: TCountArgs) => Promise<number>;
  findMany: (args?: TFindArgs & { skip?: number; take?: number }) => Promise<TItem[]>;
};

// Utility type to get the arguments for findMany, excluding pagination
type PaginateArgs<TFindArgs> = Omit<TFindArgs, "skip" | "take">;

/**
 * Generic function to paginate Prisma queries with improved type safety.
 *
 * @param model The Prisma model delegate (e.g., prisma.user).
 * @param params An object containing page and pageSize from PaginationParams.
 * @param args Prisma query arguments (where, include, select, orderBy, etc.) compatible with TFindArgs.
 * @returns A PaginatedResponse object.
 */
export async function paginatePrismaQuery<
  TItem,
  TCountArgs extends PrismaCountArgs,
  TFindArgs extends PrismaFindManyArgs,
>(
  // Pass the model delegate which should conform to the ModelDelegate structure
  model: ModelDelegate<TCountArgs, TFindArgs, TItem>,
  params: PaginationParams,
  // args should conform to the structure defined by PaginateArgs<TFindArgs>
  args: PaginateArgs<TFindArgs>
): Promise<PaginatedResponse<TItem>> {
  const { page, pageSize } = params;

  if (page <= 0 || pageSize <= 0) {
    throw new Error("Page and pageSize must be positive numbers.");
  }

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Extract where clause for count query, ensuring type compatibility
  const countArgs: TCountArgs = { where: args.where } as TCountArgs;

  // Combine args with pagination for findMany, ensuring type compatibility
  const findManyArgs = { ...args, skip, take } as TFindArgs & { skip: number; take: number };

  // Run count and findMany queries concurrently
  const [total, items] = await Promise.all([model.count(countArgs), model.findMany(findManyArgs)]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    items, // items should now be correctly typed as TItem[]
    total,
    totalPages,
    page,
    pageSize,
  };
}

/**
 * Translates enum values using i18n
 * @param t - The translation function from useTranslations
 * @param enumType - The enum type (e.g., 'creditSource', 'creditTransactionType')
 * @param value - The enum value to translate
 * @returns Translated string or original value if translation fails
 */
export function translateEnum(t: (key: string) => string, enumType: string, value: string): string {
  const key = `enums.${enumType}.${value}`;
  try {
    return t(key);
  } catch {
    return value;
  }
}

/**
 * Formats a date using the current locale (internationalized)
 * @param date - The date to format
 * @param locale - The locale string (e.g., 'en', 'zh', 'ja')
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDateI18n(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(date);
}

/**
 * Formats a date and time using the current locale (internationalized)
 * @param date - The date to format
 * @param locale - The locale string (e.g., 'en', 'zh', 'ja')
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date and time string
 */
export function formatDateTimeI18n(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };

  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(date);
}

/**
 * Formats time distance with internationalization support using date-fns
 * @param date - The date to format distance from now
 * @param locale - The locale string (e.g., 'en', 'zh', 'ja')
 * @param options - Additional options for formatDistanceToNow
 * @returns Formatted distance string
 */
export async function formatDistanceToNowI18n(
  date: Date,
  locale: Locale,
  options?: { addSuffix?: boolean; includeSeconds?: boolean }
): Promise<string> {
  const { formatDistanceToNow } = await import("date-fns");

  const localeMap = await getDateFnsLocaleMap();
  const dateFnsLocale = localeMap[locale] || localeMap[defaultLocale];
  return formatDistanceToNow(date, {
    locale: dateFnsLocale,
    addSuffix: true,
    ...options,
  });
}

export function getObjectUrl(objectId?: string) {
  if (!objectId) {
    return null;
  }

  return `/api/oss/object/${objectId}`;
}

/**
 * Copies text to clipboard using the Clipboard API
 * @param text - The text to copy to clipboard
 * @returns Promise that resolves when copy is successful
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  }
}
