import { getInvoicesAction } from "@/actions/admin/billing/invoice"; // Import the Server Action
import { PaginationParams } from "@/types/pagination";
import { useQuery } from "@tanstack/react-query";

// Define the parameters for the hook, matching the Server Action's needs
interface UseInvoicesParams extends PaginationParams {
  email?: string;
  startDate?: string; // Expecting YYYY-MM-DD string
  endDate?: string; // Expecting YYYY-MM-DD strin
}

// Helper function to wrap the Server Action call for useQuery
async function fetchInvoices(params: UseInvoicesParams) {
  // Directly call the Server Action
  return getInvoicesAction(params);
}

// The React Query hook
export function useInvoices(params: UseInvoicesParams) {
  return useQuery({
    // queryKey needs to include all params that affect the query result
    queryKey: [
      "invoices",
      params.email,
      params.startDate,
      params.endDate,
      params.page,
      params.pageSize,
    ],
    // queryFn calls the helper function
    queryFn: () => fetchInvoices(params),
    // Removed keepPreviousData due to type error, consider placeholderData in v5+ if needed
    // placeholderData: previousData => previousData,
    // Optional: Add staleTime or gcTime if needed
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
