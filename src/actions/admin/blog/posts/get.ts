"use server";

import { getPostById } from "@/db/blog/posts";
import { isAdmin } from "@/lib/auth/utils";

export async function getPost(id: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }
  return getPostById(id);
}
