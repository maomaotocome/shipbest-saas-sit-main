import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "react-hot-toast";
import { getMaxFileSize, isSupportedFileType, formatFileSize } from "@/lib/config/upload";

interface UseFileValidationProps {
  maxSize?: number;
  multiple?: boolean;
  accept?: string;
}

export const useFileValidation = ({ maxSize, multiple = false, accept }: UseFileValidationProps) => {
  const t = useTranslations("uploader");

  const validateFiles = useCallback(
    (files: File[]): { isValid: boolean; validFiles: File[] } => {
      // 检查单文件限制
      if (!multiple && files.length > 1) {
        toast.error(t("messages.singleFileOnly"));
        return { isValid: false, validFiles: [] };
      }

      const validFiles: File[] = [];

      for (const file of files) {
        // 检查文件类型是否支持
        if (!isSupportedFileType(file.type)) {
          toast.error(t("messages.unsupportedType") + `: ${file.type}`);
          continue;
        }

        // 检查 accept 属性
        if (accept) {
          const acceptTypes = accept.split(',').map(type => type.trim());
          const isAccepted = acceptTypes.some(acceptType => {
            if (acceptType.startsWith('.')) {
              // 文件扩展名匹配
              return file.name.toLowerCase().endsWith(acceptType.toLowerCase());
            } else if (acceptType.includes('*')) {
              // MIME 类型通配符匹配
              const pattern = acceptType.replace('*', '.*');
              return new RegExp(pattern).test(file.type);
            } else {
              // 精确 MIME 类型匹配
              return file.type === acceptType;
            }
          });

          if (!isAccepted) {
            toast.error(t("messages.unsupportedType") + `: ${file.type}`);
            continue;
          }
        }

        // 检查文件大小
        const maxFileSize = maxSize || getMaxFileSize(file.type);
        if (file.size > maxFileSize) {
          toast.error(
            t("messages.fileSizeExceeded") + 
            ` (${formatFileSize(file.size)} > ${formatFileSize(maxFileSize)}) - ${file.name}`
          );
          continue;
        }

        validFiles.push(file);
      }

      return { isValid: validFiles.length > 0, validFiles };
    },
    [multiple, maxSize, accept, t]
  );

  const getFileSizeLimit = useCallback(
    (fileType?: string) => {
      if (maxSize) return maxSize;
      if (!fileType) return getMaxFileSize('other');
      return getMaxFileSize(fileType);
    },
    [maxSize]
  );

  const getFileSizeLimitText = useCallback(
    (fileType?: string) => {
      const limit = getFileSizeLimit(fileType);
      return formatFileSize(limit);
    },
    [getFileSizeLimit]
  );

  return {
    validateFiles,
    getFileSizeLimit,
    getFileSizeLimitText,
    isSupportedFileType,
    formatFileSize,
  };
};