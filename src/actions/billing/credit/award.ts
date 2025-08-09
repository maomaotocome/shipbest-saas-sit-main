"use server";
import { getOrCreateBillingUserByUserId } from "@/db/billing/users";
import { CreditSource } from "@/db/generated/prisma";
import { Locale } from "@/i18n/locales";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateTurnstileToken } from "@/lib/trunslite";
import { formatDateI18n } from "@/lib/utils";
import { grantCredits } from "@/services/billing/credits/grant";
import { getLocale, getTranslations } from "next-intl/server";

async function getDescription(type: CreditSource): Promise<string> {
  const t = await getTranslations("billing");
  const locale = (await getLocale()) as Locale;

  switch (type) {
    case CreditSource.DAILY_LOGIN_AWARD:
      return t("award.daily_login", {
        date: formatDateI18n(new Date(), locale),
      });
    case CreditSource.NEW_USER_AWARD:
      return t("award.new_user");
    default:
      return "";
  }
}

interface AwardCreditsParams {
  type: CreditSource;
  turnstileToken: string;
}

function isWithin24Hours(date: Date) {
  return date.getTime() > Date.now() - 1000 * 60 * 60 * 24;
}

function getAmount(type: CreditSource) {
  switch (type) {
    case CreditSource.DAILY_LOGIN_AWARD:
      return Number(process.env.NEXT_PUBLIC_CREDIT_DAILY_LOGIN_AWARD_AMOUNT) || 0;
    case CreditSource.NEW_USER_AWARD:
      return Number(process.env.NEXT_PUBLIC_CREDIT_NEW_USER_AWARD_AMOUNT) || 0;
    default:
      return 0;
  }
}

export async function getNewUserAwardGrant() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      billingUser: {
        include: {
          creditGrants: {
            where: { source: CreditSource.NEW_USER_AWARD },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!user?.billingUser || !user?.createdAt || user.billingUser.creditGrants.length === 0) {
    return null;
  }

  return user.billingUser.creditGrants[0];
}

export async function getLastDailyLoginAwardGrant() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      billingUser: {
        include: {
          creditGrants: {
            where: {
              OR: [
                { source: CreditSource.DAILY_LOGIN_AWARD },
                { source: CreditSource.NEW_USER_AWARD },
              ],
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!user?.billingUser || !user?.createdAt || user.billingUser.creditGrants.length === 0) {
    return null;
  }

  return user.billingUser.creditGrants[0];
}

export async function awardCredits({ type, turnstileToken }: AwardCreditsParams) {
  const amount = getAmount(type);
  if (0 === amount) {
    return { error: "Credit award amount is not set" };
  }
  const isValid = await validateTurnstileToken(turnstileToken);

  if (!isValid) {
    return { error: "Invalid turnstile token" };
  }

  if (type !== CreditSource.NEW_USER_AWARD && type !== CreditSource.DAILY_LOGIN_AWARD) {
    return { error: "Invalid award type" };
  }

  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }
  const userId = session.user.id;
  await getOrCreateBillingUserByUserId({ userId });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      billingUser: {
        include: {
          creditGrants: {
            where: {
              OR: [{ source: type }, { source: CreditSource.NEW_USER_AWARD }],
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      },
    },
  });
  if (!user || !user.billingUser) {
    return { error: "User not found" };
  }
  if (type === CreditSource.NEW_USER_AWARD) {
    if (!isWithin24Hours(user.createdAt)) {
      return { error: "Registration time exceeded 24 hours" };
    }

    if (user.billingUser.creditGrants.length > 0) {
      return { error: "Already received registration award" };
    }
  } else if (type === CreditSource.DAILY_LOGIN_AWARD) {
    const lastAward = user.billingUser.creditGrants[0];
    if (lastAward) {
      const lastAwardTime = new Date(lastAward.createdAt);
      const now = new Date();
      const hoursSinceLastAward = (now.getTime() - lastAwardTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastAward < 24) {
        return { error: "Last login award was less than 24 hours ago" };
      }
    }
  }

  await grantCredits({
    billingUserId: user.billingUser.id,
    amount,
    validFrom: new Date(),
    ...(process.env.NEXT_PUBLIC_CREDIT_AWARD_VALID_DAYS
      ? {
          validUntil: new Date(
            Date.now() +
              Number(process.env.NEXT_PUBLIC_CREDIT_AWARD_VALID_DAYS) * 24 * 60 * 60 * 1000
          ),
        }
      : {}),
    source: type,
    description: await getDescription(type),
  });

  return { success: true, amount };
}
