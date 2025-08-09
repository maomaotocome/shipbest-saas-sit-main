import { JsonObject } from "@/types/json";
import { GetPresignedPutUrlResult } from "@/types/oss";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { uploadFile } from "../client/upload";
import { FileItemInfo } from "../types";
import { getMediaMetadata } from "../utils/media-info";
interface UseFileUploadProps {
  initialFiles?: FileItemInfo[];
  onChange?: (files: FileItemInfo[]) => void;
  customUpload?: ({
    file,
    isPublic,
    metadata,
    onProgress,
  }: {
    file: File;
    isPublic: boolean;
    metadata?: JsonObject;
    onProgress?: (progress: number) => void;
  }) => Promise<GetPresignedPutUrlResult>;
  isPublic?: boolean;
}

export const useFileUpload = ({
  initialFiles = [],
  onChange,
  customUpload,
  isPublic = true,
}: UseFileUploadProps) => {
  const t = useTranslations("uploader");
  const [files, setFiles] = useState<FileItemInfo[]>(initialFiles);
  const [uploading, setUploading] = useState(false);

  const handleUploadFile = useCallback(
    async (fileItem: FileItemInfo): Promise<void> => {
      if (!fileItem.file || fileItem.status === "success") return;
      try {
        setFiles((currentFiles) => {
          const fileIndex = currentFiles.findIndex((f) => f.id === fileItem.id);
          if (fileIndex === -1) return currentFiles;

          const newFiles = [...currentFiles];
          newFiles[fileIndex] = {
            ...newFiles[fileIndex],
            status: "uploading" as const,
            progress: 0,
          };
          onChange?.(newFiles);
          return newFiles;
        });

        // 获取媒体元数据
        const mediaMetadata = await getMediaMetadata(fileItem.file);
        
        // 合并原有的 metadata 和新的媒体元数据
        const combinedMetadata = {
          ...mediaMetadata,
          ...fileItem.metadata,
        };

        const uploadResponse = await (customUpload || uploadFile)({
          file: fileItem.file,
          isPublic,
          metadata: combinedMetadata,
          onProgress: async (progress) => {
            // Use setTimeout to avoid updating state during render
            setTimeout(() => {
              setFiles((currentFiles) => {
                const fileIndex = currentFiles.findIndex((f) => f.id === fileItem.id);
                if (fileIndex === -1) return currentFiles;

                const newFiles = [...currentFiles];
                newFiles[fileIndex] = {
                  ...newFiles[fileIndex],
                  progress,
                };
                onChange?.(newFiles);
                return newFiles;
              });
            }, 0);
          },
        });
        if (uploadResponse.status === "failure") {
          throw new Error(uploadResponse.message || "");
        }
        setFiles((currentFiles) => {
          const fileIndex = currentFiles.findIndex((f) => f.id === fileItem.id);
          if (fileIndex === -1) return currentFiles;

          const newFiles = [...currentFiles];
          newFiles[fileIndex] = {
            ...newFiles[fileIndex],
            status: "success" as const,
            url: uploadResponse.data.url,
            objectId: uploadResponse.data.id,
            name: uploadResponse.data.originName || fileItem.name,
            size: uploadResponse.data.size || fileItem.size,
            type: uploadResponse.data.type || fileItem.type,
            isPublic: uploadResponse.data.isPublic,
          };

          onChange?.(newFiles);
          return newFiles;
        });
      } catch (error) {
        setFiles((currentFiles) => {
          const fileIndex = currentFiles.findIndex((f) => f.id === fileItem.id);
          if (fileIndex === -1) return currentFiles;

          const newFiles = [...currentFiles];
          newFiles[fileIndex] = {
            ...newFiles[fileIndex],
            status: "error" as const,
          };
          onChange?.(newFiles);
          return newFiles;
        });

        toast.error(
          t("messages.uploadFailed") +
            (error instanceof Error ? error.message : t("messages.uploadError"))
        );
      }
    },
    [customUpload, onChange, isPublic, t]
  );

  return {
    files,
    setFiles,
    uploading,
    setUploading,
    handleUploadFile,
  };
};
