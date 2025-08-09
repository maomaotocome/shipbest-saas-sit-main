import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Ban, Trash2, UploadCloud } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { FileItemInfo } from "./types";

interface UploaderToolbarProps {
  files: FileItemInfo[];
  onUploadAll: () => void;
  onCancelAll: () => void;
  onClearAll: () => Promise<void>;
  uploadMode: "immediate" | "manual" | "submit";
  className?: string;
}

const UploaderToolbar: React.FC<UploaderToolbarProps> = ({
  files,
  onUploadAll,
  onCancelAll,
  onClearAll,
  uploadMode,
  className = "",
}) => {
  const t = useTranslations("uploader");
  const [isClearing, setIsClearing] = useState(false);

  if (uploadMode === "immediate" || files.length === 0) {
    return null;
  }

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await onClearAll();
    } finally {
      setIsClearing(false);
    }
  };

  const calculateTotalProgress = () => {
    const uploadingFiles = files.filter((f) => f.status === "uploading" || f.status === "success");
    if (uploadingFiles.length === 0) return 0;

    const totalProgress = uploadingFiles.reduce((sum, file) => {
      return sum + (file.progress || 0);
    }, 0);

    return totalProgress / uploadingFiles.length;
  };

  const stats = {
    ready: files.filter((f) => f.status === "ready").length,
    uploading: files.filter((f) => f.status === "uploading").length,
    success: files.filter((f) => f.status === "success").length,
    error: files.filter((f) => f.status === "error").length,
  };

  const isUploading = stats.uploading > 0;
  const hasReadyFiles = stats.ready > 0;
  const totalProgress = calculateTotalProgress();

  return (
    <div
      className={`flex items-center justify-between space-x-4 rounded-lg bg-white/10 p-4 dark:bg-black/10 ${className}`}
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {t("toolbar.total")}: {files.length}
          </span>
          {stats.ready > 0 && (
            <span className="text-sm text-blue-500 dark:text-blue-400">
              {t("toolbar.pending")}: {stats.ready}
            </span>
          )}
          {stats.uploading > 0 && (
            <span className="text-sm text-yellow-500 dark:text-yellow-400">
              {t("toolbar.uploading")}: {stats.uploading}
            </span>
          )}
          {stats.success > 0 && (
            <span className="text-sm text-green-500 dark:text-green-400">
              {t("toolbar.success")}: {stats.success}
            </span>
          )}
          {stats.error > 0 && (
            <span className="text-sm text-red-500 dark:text-red-400">
              {t("toolbar.failed")}: {stats.error}
            </span>
          )}
        </div>
        {isUploading && (
          <div className="flex w-40 items-center space-x-2">
            <Progress value={totalProgress} className="h-2" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(totalProgress)}%
            </span>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        {hasReadyFiles && (
          <Button size="sm" onClick={onUploadAll} disabled={isUploading || !hasReadyFiles}>
            <UploadCloud className="mr-1 h-4 w-4" />
            {t("toolbar.startUpload")}
          </Button>
        )}
        {isUploading && (
          <Button size="sm" variant="outline" onClick={onCancelAll}>
            <Ban className="mr-1 h-4 w-4" />
            {t("toolbar.cancelUpload")}
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={handleClearAll} disabled={isClearing}>
          <Trash2 className="mr-1 h-4 w-4" />
          {isClearing ? t("toolbar.clearing") : t("toolbar.clear")}
        </Button>
      </div>
    </div>
  );
};

export default UploaderToolbar;
