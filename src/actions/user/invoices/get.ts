"use server";
import { getUserInvoices, UserInvoiceDetail } from "@/db/billing/invoices/getUserInvoices";
import { getUser, isAuthenticated } from "@/lib/auth/utils";
import { PaginatedResponse, PaginationParams } from "@/types/pagination"; // Import pagination types

export async function getInvoices(
  params: PaginationParams // Accept pagination params
): Promise<PaginatedResponse<UserInvoiceDetail>> {
  // Return PaginatedResponse
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }

  try {
    // Pass userId and params to the refactored DB function
    const paginatedInvoices = await getUserInvoices(user.id, params);
    return paginatedInvoices; // Return the paginated response
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw new Error("Failed to fetch invoices");
  }
}
