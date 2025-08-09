"use server";

import { createTag, getAllTags } from "@/db/blog/tags";
import { Prisma } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";
import { TagWithTranslations } from "@/types/blog";
import { PaginatedResponse, PaginationParams } from "@/types/pagination";

export async function getTagsListAction(
  params: PaginationParams & {
    searchSlug?: string;
    searchName?: string;
  }
): Promise<PaginatedResponse<TagWithTranslations>> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return await getAllTags(params);
  } catch (error) {
    console.error("Error fetching tags:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch tags: ${error.message}`);
    }
    throw new Error("Failed to fetch tags due to an unknown error");
  }
}

export async function createNewTagAction(data: Prisma.BlogTagCreateArgs) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return createTag(data);
  } catch (error) {
    console.error("Error creating tag:", error);
    throw new Error("Failed to create tag");
  }
}
