"use client";
import { FolderOpen, Loader2, Trash2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { ImagePreviewDialog } from "../image-preview-dialog";
interface FileActionsProps {
  onDelete: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLibraryPick: () => void;
  accept?: string;
  showLibraryPicker?: boolean;
  isVisible?: boolean;
  isDeleting?: boolean;
  imageUrl?: string;
  fileName?: string;
}

export const FileActions: React.FC<FileActionsProps> = ({
  onDelete,
  onUpload,
  onLibraryPick,
  accept,
  showLibraryPicker,
  isVisible,
  isDeleting,
  imageUrl,
  fileName,
}) => {
  const t = useTranslations("uploader");
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  return (
    <>
      <div
        className={`absolute inset-0 transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 cursor-pointer bg-white/40 dark:bg-black/40"
          onClick={() => {
            if (imageUrl) {
              setShowPreviewDialog(true);
            }
          }}
        />
        <div className="absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 gap-2">
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="rounded-full p-1 text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            title={isDeleting ? t("fileActions.deleting") : t("fileActions.delete")}
          >
            {isDeleting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </button>
          <label
            className="cursor-pointer rounded-full p-1 text-white hover:bg-blue-500"
            title={t("fileActions.upload")}
          >
            <input type="file" className="hidden" onChange={onUpload} accept={accept} />
            <Upload className="h-5 w-5" />
          </label>
          {showLibraryPicker && (
            <button
              onClick={onLibraryPick}
              className="rounded-full p-1 text-white hover:bg-green-500"
              title={t("fileActions.selectFromLibrary")}
            >
              <FolderOpen className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {imageUrl && fileName && (
        <ImagePreviewDialog
          isOpen={showPreviewDialog}
          onClose={() => setShowPreviewDialog(false)}
          imageUrl={imageUrl}
          fileName={fileName}
        />
      )}
    </>
  );
};
