"use server";

import { getAllAuthors } from "@/db/blog/authors";
import { isAdmin } from "@/lib/auth/utils";

export async function getAuthorsAction() {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return await getAllAuthors();
  } catch (error) {
    console.error("Error fetching authors:", error);
    throw new Error("Failed to fetch authors");
  }
}
