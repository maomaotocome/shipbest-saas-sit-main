"use server";

import {
  deletePaymentProvider,
  getPaymentProviderById,
  updatePaymentProvider,
} from "@/db/billing/payment/providers/providers";
import { Prisma } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";
export async function getProvider(id: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const provider = await getPaymentProviderById(id);
    if (!provider) {
      throw new Error("Provider not found");
    }
    return provider;
  } catch (error) {
    console.error("Error in GET providers:", error);
    throw new Error("Failed to fetch providers");
  }
}

export async function updateProvider(id: string, data: Prisma.PaymentProviderAccountUpdateInput) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const provider = await updatePaymentProvider({ id, ...data });
    return provider;
  } catch (error) {
    console.error("Error updating payment provider:", error);
    throw new Error("Failed to update payment provider");
  }
}

export async function deleteProvider(id: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    if (!id) {
      throw new Error("Provider ID is required");
    }

    await deletePaymentProvider(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting payment provider:", error);
    throw new Error("Failed to delete payment provider");
  }
}
