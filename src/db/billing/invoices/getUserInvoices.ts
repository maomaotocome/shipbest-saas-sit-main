import { Prisma } from "@/db/generated/prisma";
import { Locale } from "@/i18n/locales";
import { prisma } from "@/lib/prisma";
import { paginatePrismaQuery } from "@/lib/utils";
import { ModelDelegate, PaginatedResponse, PaginationParams } from "@/types/pagination";
import { getLocale } from "next-intl/server";

// Define the specific type inferred by Prisma GetPayload for the included invoice
type PrismaUserInvoicePayloadWithArrays = Prisma.InvoiceGetPayload<{
  include: {
    subscriptionPeriod: {
      include: {
        subscription: {
          include: {
            planPeriod: {
              include: {
                plan: {
                  include: {
                    translations: true;
                  };
                };
              };
            };
          };
        };
      };
    };
    purchase: {
      include: {
        planPeriod: {
          include: {
            plan: {
              include: {
                translations: true;
              };
            };
          };
        };
      };
    };
  };
}>;

// Extract the non-nullable object types
export type UserPurchaseObject = NonNullable<PrismaUserInvoicePayloadWithArrays["purchase"]>;
export type UserSubscriptionPeriodObject = NonNullable<
  PrismaUserInvoicePayloadWithArrays["subscriptionPeriod"]
>;

// Define the final payload type we want to return
// We reuse the base Invoice type and add the correctly typed relations
export type FinalUserInvoicePayload = Omit<
  PrismaUserInvoicePayloadWithArrays,
  "purchase" | "subscriptionPeriod"
> & {
  purchase: UserPurchaseObject | null;
  subscriptionPeriod: UserSubscriptionPeriodObject | null;
};

// Keep the UserInvoiceDetail alias for backward compatibility or explicit reference
export type UserInvoiceDetail = FinalUserInvoicePayload;

export async function getUserInvoices(
  userId: string,
  params: PaginationParams
): Promise<PaginatedResponse<FinalUserInvoicePayload>> {
  const locale = (await getLocale()) as Locale;

  const billingUser = await prisma.billingUser.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!billingUser) {
    return {
      items: [],
      total: 0,
      totalPages: 0,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  const prismaArgs: Omit<Prisma.InvoiceFindManyArgs, "skip" | "take"> = {
    where: {
      billingUserId: billingUser.id,
    },
    orderBy: { createdAt: "desc" },
    include: {
      subscriptionPeriod: {
        include: {
          subscription: {
            include: {
              planPeriod: {
                include: {
                  plan: {
                    include: {
                      translations: {
                        where: { locale },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      purchase: {
        include: {
          planPeriod: {
            include: {
              plan: {
                include: {
                  translations: {
                    where: { locale },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  const paginatedResult = await paginatePrismaQuery<
    PrismaUserInvoicePayloadWithArrays,
    Prisma.InvoiceCountArgs,
    Prisma.InvoiceFindManyArgs
  >(
    prisma.invoice as unknown as ModelDelegate<
      Prisma.InvoiceCountArgs,
      Prisma.InvoiceFindManyArgs,
      PrismaUserInvoicePayloadWithArrays
    >,
    params,
    prismaArgs
  );

  const transformedItems: FinalUserInvoicePayload[] = paginatedResult.items.map((invoice) => {
    const purchaseAsUnknown = invoice.purchase as unknown;
    const finalPurchase = Array.isArray(purchaseAsUnknown)
      ? ((purchaseAsUnknown[0] as UserPurchaseObject) ?? null)
      : (invoice.purchase as UserPurchaseObject | null);

    const subscriptionPeriodAsUnknown = invoice.subscriptionPeriod as unknown;
    const finalSubscriptionPeriod = Array.isArray(subscriptionPeriodAsUnknown)
      ? ((subscriptionPeriodAsUnknown[0] as UserSubscriptionPeriodObject) ?? null)
      : (invoice.subscriptionPeriod as UserSubscriptionPeriodObject | null);

    return {
      ...(invoice as Omit<PrismaUserInvoicePayloadWithArrays, "purchase" | "subscriptionPeriod">),
      purchase: finalPurchase,
      subscriptionPeriod: finalSubscriptionPeriod,
    };
  });

  return {
    ...paginatedResult,
    items: transformedItems,
  };
}
