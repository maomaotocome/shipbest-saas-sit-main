import { Prisma } from "@/db/generated/prisma";
import { defaultLocale, type Locale } from "@/i18n/locales";
import { prisma } from "@/lib/prisma";

export async function getAllFeatures(locale: Locale, withDefaultLocale = false) {
  return await prisma.feature.findMany({
    include: {
      translations: locale
        ? {
            where: {
              locale: withDefaultLocale ? { in: [locale, defaultLocale] } : { equals: locale },
            },
          }
        : true,
    },
  });
}

export async function createFeature(data: Prisma.FeatureCreateInput) {
  return prisma.feature.create({
    data,
  });
}

export async function getFeatureById(featureId: string, locale?: Locale) {
  return await prisma.feature.findUnique({
    where: { id: featureId },
    include: {
      translations: locale
        ? {
            where: { locale },
          }
        : true,
    },
  });
}

export async function updateFeature(data: Prisma.FeatureUpdateInput) {
  await prisma.feature.update({
    where: { id: data.id as string },
    data: data,
  });
}

export async function deleteFeature(featureId: string) {
  const existingFeature = await prisma.feature.findUnique({
    where: { id: featureId },
    include: {
      translations: true,
      plans: {
        include: {
          plan: true,
        },
      },
      periodAllocations: true,
    },
  });

  if (!existingFeature) {
    return { success: false, error: "Feature not found", status: 404 };
  }
  if (existingFeature.plans.length > 0) {
    throw new Error("Cannot delete feature that is used by plans");
  }

  await prisma.$transaction(async (tx) => {
    await tx.featureTranslation.deleteMany({
      where: { featureId },
    });

    await tx.planPeriodFeatureAllocation.deleteMany({
      where: { featureId },
    });

    await tx.planFeatureRelation.deleteMany({
      where: { featureId },
    });

    await tx.feature.delete({
      where: { id: featureId },
    });
  });

  return { success: true };
}
