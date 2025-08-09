"use server";

import { UserListItem, getAllUsers, getUserById, updateUserRole } from "@/db/auth/user";
import { Role } from "@/db/generated/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/auth/utils";
import { PaginatedResponse, PaginationParams } from "@/types/pagination";

interface GetUsersActionParams extends PaginationParams {
  search?: string;
  searchName?: string;
  searchEmail?: string;
}

export async function getUsers(
  params: GetUsersActionParams
): Promise<PaginatedResponse<UserListItem>> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await getAllUsers(params);
    return result;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function updateUserRoleAction(data: { id: string; role: Role }) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    const { id, role } = data;

    const targetUser = await getUserById(id);
    if (session.user.email === targetUser?.email) {
      throw new Error("Cannot modify your own role");
    }

    if (!Object.values(Role).includes(role)) {
      throw new Error("Invalid role");
    }

    const user = await updateUserRole(id, role);
    return user;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}
