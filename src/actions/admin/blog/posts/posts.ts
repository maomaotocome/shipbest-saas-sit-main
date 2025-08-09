"use server";

import { getAllPosts } from "@/db/blog/posts";
import { isAdmin } from "@/lib/auth/utils";
import { PostWithRelations } from "@/types/blog";
import { PaginatedResponse, PaginationParams } from "@/types/pagination";

export async function getPostsList(
  params: PaginationParams & {
    searchTitle?: string;
    searchAuthor?: string;
  }
): Promise<PaginatedResponse<PostWithRelations>> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return await getAllPosts(params);
  } catch (error) {
    console.error("Error fetching posts:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }
    throw new Error("Failed to fetch posts due to an unknown error");
  }
}
