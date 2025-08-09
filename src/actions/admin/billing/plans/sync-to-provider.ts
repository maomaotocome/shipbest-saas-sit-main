"use server";

import { isAdmin } from "@/lib/auth/utils";
import { ensurePaymentProviderProducts } from "@/services/billing/payment/product/ensure-payment-provider-products";

export async function syncPlansToProvider(providerId: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    await ensurePaymentProviderProducts(providerId);
    return {
      success: true,
      message: `Successfully synced plans to provider ${providerId}`,
    };
  } catch (error) {
    console.error("Error syncing plans to provider:", error);
    throw new Error("Failed to sync plans to provider");
  }
}
