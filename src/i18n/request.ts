import { type Locale } from "@/i18n/locales";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
interface NestedMessages {
  [key: string]: string | NestedMessages;
}
const NAMESPACES = [
  "components",
  "header",
  "footer",
  "home",
  "about",
  "pricing",
  "blog",
  "workspace",
  "uploader",
  "locale",
  "plans",
  "auth",
  "billing",
  "credit",
  "task",
  "common",
  "studio",

  "playground/main",
  "playground/chat",

  "ai/video/text-to-video",
  "ai/video/image-to-video",
  "ai/image/text-to-image",
  "ai/image/stylize-anime",
  "ai/image/image-to-image",
  "ai/audio/text-to-music",
  "ai/explore",
  "ai/common",

  "user/menu",
  "user/subscriptions",
  "user/invoices",
  "user/purchases",
  "user/credits",
  "user/notifications",
  "user/thanks",
  "user/dashboard",
  "user/profile",
  "user/order",
  "user/library",

  "admin/dashboard",
  "admin/menu",
  "admin/users",
  "admin/blog",
  "admin/oss",
  "admin/explore",
  "admin/notifications",
  "admin/billing/plans",
  "admin/billing/payment-providers",
  "admin/billing/subscriptions",
  "admin/billing/purchases",
  "admin/billing/invoice",
] as const;

// Deep merge function to properly handle nested objects
function deepMerge(target: NestedMessages, source: NestedMessages): NestedMessages {
  if (typeof source !== "object" || source === null) {
    return source;
  }

  if (typeof target !== "object" || target === null) {
    return deepMerge({}, source);
  }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = deepMerge(target[key] as NestedMessages, source[key] as NestedMessages);
    }
  }

  return target;
}

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  // Load all message files for the current locale
  const messagePromises = NAMESPACES.map((namespace) => {
    return import(`./messages/${locale}/${namespace}.json`);
  });

  const messageModules = await Promise.all(messagePromises);

  // Merge all message objects using deep merge
  const messages = messageModules.reduce((acc, module) => deepMerge(acc, module.default), {});

  return {
    locale,
    messages,
    timeZone: process.env.NEXT_PUBLIC_TIME_ZONE,
    formats: {
      dateTime: {
        short: {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
        medium: {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
        },
        long: {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        },
        dateOnly: {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
        timeOnly: {
          hour: "numeric",
          minute: "numeric",
        },
      },
    },
  };
});
