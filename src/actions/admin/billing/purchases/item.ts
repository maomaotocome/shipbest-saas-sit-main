"use server";

import { isAdmin } from "@/lib/auth/utils";
export async function getPurchase(id: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return { message: `Get purchase ${id}` };
  } catch (error) {
    console.error("Error fetching purchase:", error);
    throw new Error("Failed to fetch purchase");
  }
}
