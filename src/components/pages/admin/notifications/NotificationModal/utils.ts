import { getUsers } from "@/actions/admin/user/users";
import { UsersResponse } from "./types";

export async function fetchUsers(
  search: string,
  page: number,
  pageSize: number
): Promise<UsersResponse> {
  try {
    const result = await getUsers({
      search,
      page,
      pageSize,
    });
    return {
      data: result.items || [],
      total: result.total || 0,
      totalPages: result.totalPages || 1,
    };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to fetch users");
  }
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return "";
  return typeof date === "string" ? date.slice(0, 16) : new Date(date).toISOString().slice(0, 16);
}
