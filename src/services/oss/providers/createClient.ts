import { OssBucket, OssProvider } from "@/db/generated/prisma";
import { OssClient } from "./OssClient";
import { S3OssClient } from "./S3/S3OssClient";

export function createOssClient(bucket: OssBucket): OssClient {
  switch (bucket.provider) {
    case OssProvider.S3:
    case OssProvider.R2:
      return new S3OssClient(bucket);
    default:
      throw new Error(`Unsupported provider: ${bucket.provider}`);
  }
}
