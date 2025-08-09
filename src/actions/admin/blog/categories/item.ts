"use server";

import { deleteCategory, getCategory, updateCategory } from "@/db/blog/categories";
import { Prisma } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";
export async function getCategoryDetail(id: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const category = await getCategory(id);
    return category;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw new Error("Failed to fetch category");
  }
}

export async function updateCategoryAction(data: Prisma.BlogCategoryUpdateArgs) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return await updateCategory(data);
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Failed to update category");
  }
}

export async function deleteCategoryAction(id: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    if (!id) {
      throw new Error("Category ID is required");
    }

    await deleteCategory(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category");
  }
}
