"use server";

import { deletePost } from "@/db/blog/posts";
import { isAdmin } from "@/lib/auth/utils";

export async function deletePostAction(id: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }
  return deletePost(id);
}
