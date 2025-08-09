import { OssObject } from "@/db/generated/prisma";
import { JsonObject } from "../json";

export type FileUploadInfo = {
  filename: string;
  type: string;
  size: number;
  isPublic: boolean;
  file?: File;
  metadata?: JsonObject;
  hash?: string;
};

export interface StorageObject extends OssObject {
  putUrl?: string;
  getUrl?: string;
  url?: string;
}

export type GetPresignedPutUrlResult =
  | {
      status: "success";
      data: StorageObject;
    }
  | {
      status: "failure";
      message: string;
    };
