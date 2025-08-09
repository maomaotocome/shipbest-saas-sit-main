"use server";

import { createPost } from "@/db/blog/posts";
import { Prisma } from "@/db/generated/prisma";
import { isAdmin } from "@/lib/auth/utils";

export async function createPostAction(data: Prisma.BlogPostCreateArgs) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  return createPost(data);
}
