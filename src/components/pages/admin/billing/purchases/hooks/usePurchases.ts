import { getPurchases } from "@/actions/admin/billing/purchases/purchases";
import { Prisma } from "@/db/generated/prisma";
import { PaginatedResponse, PaginationParams } from "@/types/pagination";
import { useQuery } from "@tanstack/react-query";

export type PurchaseWithDetail = Prisma.PurchaseGetPayload<{
  include: {
    billingUser: {
      include: {
        user: {
          select: {
            email: true;
            name: true;
          };
        };
      };
    };
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
}>;

interface UsePurchasesParams extends PaginationParams {
  status: string;
}

export function usePurchases({ page, pageSize, status }: UsePurchasesParams) {
  return useQuery<PaginatedResponse<PurchaseWithDetail>>({
    queryKey: ["purchases", page, pageSize, status],
    queryFn: () => getPurchases({ page, pageSize, status }),
  });
}
