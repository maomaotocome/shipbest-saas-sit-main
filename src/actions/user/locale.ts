"use server";

import { updateUserLocale } from "@/db/auth/user";
import { type Locale } from "@/i18n/locales";
import { getUser, isAuthenticated } from "@/lib/auth/utils";

export async function updateLocale(locale: Locale) {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  if (!locale && user.locale !== locale) {
    await updateUserLocale(user.id, locale);
  }
  return { success: true };
}
