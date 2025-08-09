import { getUserAvailableCredits } from "@/actions/billing/credit/available";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface UserCredits {
  totalCredits: number;
  grantsCount: number;
}

export const USER_CREDITS_QUERY_KEY = ["user-credits"];

export function useUserCredits(options?: { enabled?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: USER_CREDITS_QUERY_KEY,
    queryFn: async (): Promise<UserCredits | null> => {
      return await getUserAvailableCredits();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // do not refetch on window focus
    refetchOnMount: true, // refetch on mount,
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval, // optional auto refresh interval
  });
}

export function useRefreshUserCredits() {
  const queryClient = useQueryClient();

  return {
    refreshCredits: () => {
      return queryClient.invalidateQueries({
        queryKey: USER_CREDITS_QUERY_KEY,
      });
    },
    prefetchCredits: () => {
      return queryClient.prefetchQuery({
        queryKey: USER_CREDITS_QUERY_KEY,
        queryFn: async () => await getUserAvailableCredits(),
        staleTime: 5 * 60 * 1000,
      });
    },
    setCreditsData: (data: UserCredits | null) => {
      queryClient.setQueryData(USER_CREDITS_QUERY_KEY, data);
    },
  };
}
