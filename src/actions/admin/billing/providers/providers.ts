"use server";

import {
  createPaymentProvider,
  getPaymentProviders,
} from "@/db/billing/payment/providers/providers";
import { Prisma } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";

export async function getProviders() {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const providers = await getPaymentProviders({});
    return providers;
  } catch (error) {
    console.error("Error in GET providers:", error);
    throw new Error("Failed to fetch providers");
  }
}

export async function createProvider(data: Prisma.PaymentProviderAccountCreateInput) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const provider = await createPaymentProvider(data);
    return provider;
  } catch (error) {
    console.error("Error creating payment provider:", error);
    throw new Error("Failed to create payment provider");
  }
}
