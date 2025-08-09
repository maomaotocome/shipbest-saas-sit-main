import { getUsers, updateUserRoleAction } from "@/actions/admin/user/users";
import { UserListItem } from "@/db/auth/user";
import { PaginatedResponse, PaginationParams } from "@/types/pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UseUsersParams extends PaginationParams {
  searchName?: string;
  searchEmail?: string;
}

export function useUsers(params: UseUsersParams) {
  const { page, pageSize, searchName, searchEmail } = params;
  return useQuery<PaginatedResponse<UserListItem>>({
    queryKey: ["items", page, pageSize, searchName, searchEmail],
    queryFn: () => getUsers({ page, pageSize, searchName, searchEmail }),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserRoleAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
