"use server";

import { deleteTag, getTag, updateTag } from "@/db/blog/tags";
import { Prisma } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";
export async function getTagDetailAction(id: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    const tag = await getTag(id);
    return tag;
  } catch (error) {
    console.error("Error fetching tag:", error);
    throw new Error("Failed to fetch tag");
  }
}

export async function updateTagAction(data: Prisma.BlogTagUpdateArgs) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return updateTag(data);
  } catch (error) {
    console.error("Error updating tag:", error);
    throw new Error("Failed to update tag");
  }
}

export async function deleteTagAction(id: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    if (!id) {
      throw new Error("Tag ID is required");
    }

    await deleteTag(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting tag:", error);
    throw new Error("Failed to delete tag");
  }
}
