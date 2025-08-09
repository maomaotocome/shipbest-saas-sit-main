"use client";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { EmptyState } from "./EmptyState";
import { FileActions } from "./FileActions";
import { FilePreview } from "./FilePreview";
import { ReplaceDialog } from "./ReplaceDialog";
import { FileItemInfo } from "./types";
interface FileItemProps {
  item?: FileItemInfo;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
  onLibraryPick: () => void;
  onReplace: (file: File) => void;
  accept?: string;
  showLibraryPicker?: boolean;
  style?: React.CSSProperties;
  uploadMode?: "immediate" | "manual" | "submit";
  className?: string;
}

export const FileItem: React.FC<FileItemProps> = ({
  item,
  onUpload,
  onDelete,
  onLibraryPick,
  onReplace,
  accept,
  showLibraryPicker,
  style,
  className,
  uploadMode = "immediate",
}) => {
  const t = useTranslations("uploader");
  const [isHovered, setIsHovered] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [draggedFile, setDraggedFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (item) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    if (droppedFiles.length > 1) {
      toast.error(t("messages.dragSingleFile"));
      return;
    }

    const file = droppedFiles[0];
    if (accept) {
      const acceptedTypes = accept.split(",");
      const fileExtension = `.${file.name.split(".").pop()}`.toLowerCase();
      if (!acceptedTypes.some((type) => type.toLowerCase() === fileExtension)) {
        toast.error(t("messages.unsupportedType"));
        return;
      }
    }

    if (item) {
      setDraggedFile(file);
      setShowReplaceDialog(true);
    }
  };

  const handleReplace = () => {
    if (draggedFile) {
      onReplace(draggedFile);
      setShowReplaceDialog(false);
      setDraggedFile(null);
    }
  };

  const handleDeleteWithLoading = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      toast.error(t("messages.deleteFailed"));
      console.error(error as string);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "group relative flex items-center justify-center overflow-hidden rounded-lg",
          isDraggingOver ? "border-blue-500 bg-blue-50" : "border-gray-300",
          item ? "" : "cursor-pointer",
          className
        )}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {item ? (
          <>
            <div className="preview-area absolute inset-0 z-0 h-full w-full">
              <FilePreview item={item} uploadMode={uploadMode} />
            </div>
            <div className="absolute inset-0 z-10">
              <FileActions
                onDelete={handleDeleteWithLoading}
                onUpload={onUpload}
                onLibraryPick={onLibraryPick}
                accept={accept}
                showLibraryPicker={showLibraryPicker}
                isVisible={isHovered || isDraggingOver}
                isDeleting={isDeleting}
                imageUrl={item.type.startsWith("image/") ? item.previewUrl || undefined : undefined}
                fileName={item.name}
              />
            </div>
            {isDraggingOver && (
              <div className="bg-opacity-20 absolute inset-0 z-30 flex items-center justify-center bg-blue-500">
                <span className="text-sm text-blue-700">{t("messages.dropToReplace")}</span>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            onUpload={onUpload}
            onLibraryPick={onLibraryPick}
            accept={accept}
            showLibraryPicker={showLibraryPicker}
          />
        )}
      </div>

      <ReplaceDialog
        isOpen={showReplaceDialog}
        onClose={() => setShowReplaceDialog(false)}
        onReplace={handleReplace}
        currentFile={item}
        newFile={draggedFile || undefined}
      />
    </>
  );
};
