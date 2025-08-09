import { OssBucket, OssProvider } from "@/db/generated/prisma";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { OssClient } from "../OssClient";

export function createS3Client(bucket: OssBucket): S3Client {
  const config: S3ClientConfig = {
    endpoint: bucket.endpoint || undefined,
    region: bucket.region || "",
    credentials: {
      accessKeyId: bucket.accessKey || "",
      secretAccessKey: bucket.secretKey || "",
    },
    forcePathStyle: bucket.provider !== OssProvider.S3,
  };
  return new S3Client(config);
}

export class S3OssClient extends OssClient {
  private client: S3Client;
  private bucket: OssBucket;
  constructor(bucket: OssBucket) {
    super();
    this.bucket = bucket;
    this.client = createS3Client(bucket);
  }

  async getSignedPutUrl(key: string, expires: number = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: expires });
  }

  async getSignedGetUrl(key: string, expires: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: expires });
  }

  async getPublicUrl(key: string): Promise<string | null> {
    if (!this.bucket.publicUrl) {
      return null;
    }
    return `${this.bucket.publicUrl}/${key}`;
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket.bucket, Key: key }));
  }

  async uploadObject(key: string, file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket.bucket,
        Key: key,
        Body: new Uint8Array(arrayBuffer),
      })
    );
    return key;
  }
}
