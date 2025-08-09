import { permission } from "@/actions/user/permission";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export function useUserPermission() {
  const queryClient = useQueryClient();
  const session = useSession();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user-permission"],
    queryFn: permission,
    staleTime: 5 * 60 * 1000, // cache 5 minutes
    gcTime: 10 * 60 * 1000, // gc 10 minutes
  });
  if (!session) {
    return {
      hasPrivateTaskPermission: false,
      hasStudioPermission: false,
      isLoading: false,
      error: null,
      refetch: () => {},
      invalidatePermission: () => {},
    };
  }

  const invalidatePermission = () => {
    queryClient.invalidateQueries({
      queryKey: ["user-permission"],
    });
  };

  return {
    hasPrivateTaskPermission: data?.permission?.private_task ?? false,
    hasStudioPermission: data?.permission?.studio ?? false,
    isLoading,
    error,
    refetch,
    invalidatePermission,
  };
}
