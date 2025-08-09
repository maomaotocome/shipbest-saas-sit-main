"use server";

import { PurchaseStatus } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";
import { prisma } from "@/lib/prisma";

export async function refundPurchase(id: string, reason: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    console.info(reason);
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        billingUser: true,
      },
    });

    if (!purchase) {
      throw new Error("Purchase not found");
    }

    if (purchase.status === PurchaseStatus.REFUNDED) {
      throw new Error("Purchase already refunded");
    }

    const updatedPurchase = await prisma.purchase.update({
      where: { id },
      data: {
        status: PurchaseStatus.REFUNDED,
      },
    });

    return {
      message: "Purchase refunded successfully",
      data: updatedPurchase,
    };
  } catch (error) {
    console.error("Failed to process refund:", error);
    throw new Error("Failed to process refund");
  }
}
