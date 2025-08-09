import { Progress } from "@/components/ui/progress";
import { getObjectUrl } from "@/lib/utils";
import { FileIcon, UploadCloud } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";
import { FileItemInfo } from "./types";

interface FilePreviewProps {
  item: FileItemInfo;
  uploadMode?: "immediate" | "manual" | "submit";
}

export const FilePreview: React.FC<FilePreviewProps> = ({ item, uploadMode = "immediate" }) => {
  const t = useTranslations("uploader");
  const showUploadBadge = uploadMode !== "immediate" && item.status === "ready";

  if (item.type.startsWith("image/") && (item.previewUrl || item.url)) {
    return (
      <div className="relative h-full w-full">
        <Image
          unoptimized
          src={
            getObjectUrl(item.previewObjectId || item.objectId) || item.previewUrl || item.url || ""
          }
          alt={item.name}
          className="h-full w-full rounded-lg object-cover"
          fill
        />
        {item.status === "uploading" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Progress value={item.progress} className="w-4/5" />
          </div>
        )}
        {item.status === "error" && (
          <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-red-500">
            <span className="text-sm text-white">{t("filePreview.uploadFailed")}</span>
          </div>
        )}
        {showUploadBadge && (
          <div className="absolute right-2 bottom-2 rounded-full bg-blue-500 p-1">
            <UploadCloud className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      <FileIcon className="h-12 w-12 text-gray-400" />
      <span className="mt-2 max-w-[90%] truncate text-xs text-gray-500">{item.name}</span>
      {item.status === "uploading" && (
        <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
          <Progress value={item.progress} className="w-4/5" />
        </div>
      )}
      {item.status === "error" && (
        <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-red-500">
          <span className="text-sm text-white">{t("filePreview.uploadFailed")}</span>
        </div>
      )}
      {showUploadBadge && (
        <div className="absolute right-2 bottom-2 rounded-full bg-blue-500 p-1">
          <UploadCloud className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
};
