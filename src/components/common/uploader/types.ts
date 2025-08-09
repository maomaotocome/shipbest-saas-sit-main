import { JsonObject } from "@/types/json";
import { GetPresignedPutUrlResult } from "@/types/oss";

export type UploadMode = "immediate" | "manual" | "submit";
export type FileStatus = "ready" | "uploading" | "success" | "error";

export interface FileItemInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
  status: FileStatus;
  progress?: number;
  objectId?: string;
  previewObjectId?: string;
  previewUrl?: string;
  isPublic?: boolean;
  metadata?: JsonObject;
}

export interface UploaderProps {
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  maxCount?: number;
  showLibraryPicker?: boolean;
  onChange?: (files: FileItemInfo[]) => void;
  value?: FileItemInfo[];
  required?: boolean;
  uploadMode?: UploadMode;
  customUpload?: ({
    file,
    metadata,
    isPublic,
    onProgress,
  }: {
    file: File;
    metadata?: JsonObject;
    isPublic: boolean;
    onProgress?: (progress: number) => void;
  }) => Promise<GetPresignedPutUrlResult>;
  className?: string;
  itemClassName?: string;
  isPublic?: boolean;
  onSubmit?: (files: FileItemInfo[]) => Promise<void> | void;
}

export interface DeleteResponse {
  success: boolean;
  message?: string;
}
