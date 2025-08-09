"use server";

import { updatePost } from "@/db/blog/posts";
import { Prisma } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";

export async function updatePostAction(data: Prisma.BlogPostUpdateArgs) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  return updatePost(data);
}
