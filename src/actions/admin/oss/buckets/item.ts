"use server";

import { Prisma } from "@/db/generated/prisma";
import { deleteOssBucket, getOssBucketById, updateOssBucket } from "@/db/oss";
import { isAdmin } from "@/lib/auth/utils";

export async function getBucket(bucketId: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return getOssBucketById(bucketId);
  } catch (error) {
    console.error("Error fetching bucket:", error);
    throw new Error("Failed to fetch bucket");
  }
}

export async function updateBucket(data: Prisma.OssBucketUpdateArgs) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return updateOssBucket(data);
  } catch (error) {
    console.error("Error updating bucket:", error);
    throw new Error("Failed to update bucket");
  }
}

export async function deleteBucket(bucketId: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    await deleteOssBucket(bucketId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting bucket:", error);
    throw new Error("Failed to delete bucket");
  }
}
