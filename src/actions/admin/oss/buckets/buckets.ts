"use server";

import { Prisma } from "@/db/generated/prisma";
import { createOssBucket, getOssBuckets } from "@/db/oss";
import { isAdmin } from "@/lib/auth/utils";
export async function getBuckets() {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return getOssBuckets();
  } catch (error) {
    console.error("Error fetching OSS buckets:", error);
    throw new Error("Failed to fetch OSS buckets");
  }
}

export async function createBucket(data: Prisma.OssBucketCreateArgs) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }

  try {
    return createOssBucket(data);
  } catch (error) {
    console.error("Error creating OSS bucket:", error);
    throw new Error("Failed to create OSS bucket");
  }
}
