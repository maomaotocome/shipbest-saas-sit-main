import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "react-hot-toast";
import { deleteStorageObject } from "../client/delete";
import { FileItemInfo } from "../types";
import { useFileValidation } from "./useFileValidation";

const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

interface UseFileOperationsProps {
  files: FileItemInfo[];
  setFiles: (files: FileItemInfo[]) => void;
  onChange?: (files: FileItemInfo[]) => void;
  multiple?: boolean;
  maxSize?: number;
  maxCount?: number;
  accept?: string;
  uploadMode?: "immediate" | "manual" | "submit";
  handleUploadFile: (fileItem: FileItemInfo) => Promise<void>;
}

export const useFileOperations = ({
  files,
  setFiles,
  onChange,
  multiple = false,
  maxSize,
  maxCount = 1,
  accept,
  uploadMode = "immediate",
  handleUploadFile,
}: UseFileOperationsProps) => {
  const t = useTranslations("uploader");
  const { validateFiles } = useFileValidation({ maxSize, multiple, accept });
  const handleDelete = useCallback(
    async (index: number) => {
      const fileToDelete = files[index];

      if (fileToDelete.status === "success" && fileToDelete.objectId) {
        try {
          const deleted = await deleteStorageObject(fileToDelete.objectId);
          if (!deleted) {
            toast.error(t("messages.deleteFailed"));
            return;
          }
        } catch (error) {
          toast.error(
            t("messages.deleteFailed") +
              (error instanceof Error ? error.message : t("messages.deleteError"))
          );
          return;
        }
      }

      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      onChange?.(newFiles);
      toast.success(t("messages.deleteSuccess"));
    },
    [files, onChange, setFiles, t]
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>, index?: number) => {
      const newFiles = Array.from(event.target.files || []);

      // 使用新的文件验证逻辑
      const { isValid, validFiles } = validateFiles(newFiles);
      if (!isValid || validFiles.length === 0) {
        return;
      }

      const fileItems: FileItemInfo[] = validFiles.map((file) => ({
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        status: "ready",
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      }));

      if (index !== undefined) {
        const newFileList = [...files];
        newFileList[index] = fileItems[0];
        setFiles(newFileList);
        onChange?.(newFileList);

        if (uploadMode === "immediate") {
          await handleUploadFile(fileItems[0]);
        }
      } else {
        const newFileList = [...files, ...fileItems].slice(0, maxCount);
        setFiles(newFileList);
        onChange?.(newFileList);

        if (uploadMode === "immediate") {
          for (const fileItem of fileItems) {
            await handleUploadFile(fileItem);
          }
        }
      }
    },
    [files, maxCount, onChange, uploadMode, handleUploadFile, setFiles, validateFiles]
  );

  return {
    handleDelete,
    handleFileChange,
  };
};
