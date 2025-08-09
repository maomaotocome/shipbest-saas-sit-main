export abstract class OssClient {
  abstract getSignedPutUrl(key: string, expires?: number): Promise<string>;
  abstract getSignedGetUrl(key: string, expires?: number): Promise<string>;
  abstract getPublicUrl(key: string): Promise<string | null>;
  abstract deleteObject(key: string): Promise<void>;
  abstract uploadObject(key: string, file: File): Promise<string>;
}
