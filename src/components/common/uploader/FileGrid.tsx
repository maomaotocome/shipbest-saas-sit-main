import { cn } from "@/lib/utils";
import React from "react";
import { AddButton } from "./AddButton";
import { FileItem } from "./Filetem";
import { FileItemInfo } from "./types";

interface FileGridProps {
  files: FileItemInfo[];
  maxCount: number;
  className?: string;
  accept?: string;
  multiple?: boolean;
  showLibraryPicker?: boolean;
  uploadMode?: "immediate" | "manual" | "submit";
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>, index?: number) => void;
  onDelete: (index: number) => void;
  onLibraryPick: () => void;
  onReplace: (index: number, file: File) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  itemClassName?: string;
}

export const FileGrid: React.FC<FileGridProps> = ({
  files,
  maxCount,
  className,
  accept,
  multiple,
  showLibraryPicker,
  uploadMode,
  onFileChange,
  onDelete,
  onLibraryPick,
  onReplace,
  onDrop,
  itemClassName,
}) => (
  <div
    className={cn("grid gap-4", className)}
    onDrop={onDrop}
    onDragOver={(e) => e.preventDefault()}
  >
    {files.map((file, index) => (
      <FileItem
        key={file.id}
        item={file}
        onUpload={(e) => onFileChange(e, index)}
        onDelete={() => onDelete(index)}
        onLibraryPick={onLibraryPick}
        onReplace={(newFile) => onReplace(index, newFile)}
        accept={accept}
        showLibraryPicker={showLibraryPicker}
        uploadMode={uploadMode}
        className={itemClassName}
      />
    ))}
    {files.length < maxCount && (
      <AddButton
        onChange={onFileChange}
        accept={accept}
        multiple={multiple}
        className={itemClassName}
      />
    )}
  </div>
);
