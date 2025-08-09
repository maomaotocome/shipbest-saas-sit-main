import { prisma } from "@/lib/prisma";

interface UpsertPeriodsPaymentProivderInfoProps {
  providerAccountId: string;
  periodsInfo: {
    periodId: string;
    providerPriceId: string;
  }[];
}
export const upsertPeriodsPaymentProivderInfo = async ({
  providerAccountId,
  periodsInfo,
}: UpsertPeriodsPaymentProivderInfoProps) => {
  for (const periodInfo of periodsInfo) {
    await prisma.planPeriodProviderConfig.upsert({
      where: {
        planPeriodId_accountId: {
          accountId: providerAccountId,
          planPeriodId: periodInfo.periodId,
        },
      },
      update: {
        providerPriceId: periodInfo.providerPriceId,
      },
      create: {
        accountId: providerAccountId,
        planPeriodId: periodInfo.periodId,
        providerPriceId: periodInfo.providerPriceId,
      },
    });
  }
};
