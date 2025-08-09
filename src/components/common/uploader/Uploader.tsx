"use client";
import { useTranslations } from "next-intl";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { toast } from "react-hot-toast";
import { deleteStorageObject } from "./client/delete";
import { FileGrid } from "./FileGrid";
import FileLibraryModal from "./FileLibraryModal";
import { useFileOperations } from "./hooks/useFileOperations";
import { useFileUpload } from "./hooks/useFileUpload";
import { useModal } from "./hooks/useModal";
import { FileItemInfo, UploaderProps } from "./types";
import UploaderToolbar from "./UploaderToolbar";
export interface UploaderRef {
  upload: () => Promise<void>;
  clear: () => Promise<void>;
  getFiles: () => FileItemInfo[];
}

export const Uploader = forwardRef<UploaderRef, UploaderProps>(
  (
    {
      multiple = false,
      accept,
      maxSize,
      maxCount = 1,
      showLibraryPicker = false,
      onChange,
      value = [],
      uploadMode = "immediate",
      customUpload,
      className,
      isPublic = true,
      itemClassName,
      onSubmit,
    },
    ref
  ) => {
    const t = useTranslations("uploader");

    const { files, setFiles, uploading, setUploading, handleUploadFile } = useFileUpload({
      initialFiles: value,
      onChange,
      customUpload,
      isPublic,
    });

    // Keep a ref to access the latest files state
    const filesRef = useRef(files);
    useEffect(() => {
      filesRef.current = files;
    }, [files]);

    const { handleDelete, handleFileChange } = useFileOperations({
      files,
      setFiles,
      onChange,
      multiple,
      maxSize,
      maxCount,
      accept,
      uploadMode,
      handleUploadFile,
    });

    const {
      isModalOpen: isLibraryModalOpen,
      openModal: openLibraryModal,
      closeModal: closeLibraryModal,
    } = useModal();

    const handleDrop = useCallback(
      async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const droppedFiles = Array.from(event.dataTransfer.files);
        if (!multiple && droppedFiles.length > 1) {
          toast.error(t("messages.singleFileOnly"));
          return;
        }

        const fakeEvent = {
          target: {
            files: event.dataTransfer.files,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        await handleFileChange(fakeEvent);
      },
      [handleFileChange, multiple, t]
    );

    const handleReplace = useCallback(
      async (index: number, file: File) => {
        const fakeEvent = {
          target: {
            files: [file],
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        await handleFileChange(fakeEvent, index);
      },
      [handleFileChange]
    );

    const handleUploadAll = useCallback(async () => {
      if (uploading) return;
      setUploading(true);

      try {
        const readyFiles = files.filter((f) => f.status === "ready");

        if (uploadMode === "submit" && onSubmit) {
          await onSubmit(readyFiles);
        }

        // Start all uploads
        await Promise.all(readyFiles.map(handleUploadFile));
        onChange?.(files);
      } catch (error) {
        console.error(error);
        toast.error(t("messages.uploadFailed"));
      } finally {
        setUploading(false);
      }
    }, [files, uploading, handleUploadFile, setUploading, uploadMode, onSubmit, onChange, t]);

    const handleCancelAll = useCallback(() => {
      const newFiles: FileItemInfo[] = files.map((file) => {
        if (file.status === "uploading") {
          return { ...file, status: "ready" as const, progress: 0 };
        }
        return file;
      });
      setFiles(newFiles);
      onChange?.(newFiles);
      setUploading(false);
    }, [files, onChange, setFiles, setUploading]);

    const handleClearAll = useCallback(async () => {
      // delete all uploaded files
      const filesToDelete = files.filter((f) => f.status === "success" && f.objectId);

      if (filesToDelete.length > 0) {
        try {
          // delete all files in parallel
          await Promise.all(
            filesToDelete.map(async (file) => {
              if (file.objectId) {
                return deleteStorageObject(file.objectId);
              }
            })
          );
          toast.success(t("messages.clearAllSuccess"));
        } catch (error) {
          console.error("Clear all failed:", error);
          toast.error(t("messages.clearAllFailed"));
          return; // don't clear local state if delete failed
        }
      }

      setFiles([]);
      onChange?.([]);
    }, [files, onChange, setFiles, t]);

    const handleLibrarySelect = useCallback(
      (selectedFiles: FileItemInfo[]) => {
        const newFiles = [...files, ...selectedFiles].slice(0, maxCount);
        setFiles(newFiles);
        onChange?.(newFiles);
        closeLibraryModal();
      },
      [files, maxCount, onChange, setFiles, closeLibraryModal]
    );

    useImperativeHandle(
      ref,
      () => ({
        upload: async () => {
          if (uploadMode === "immediate") return;
          await handleUploadAll();
        },
        clear: async () => {
          await handleClearAll();
        },
        getFiles: () => files,
      }),
      [uploadMode, handleUploadAll, handleClearAll, files]
    );

    return (
      <div className="space-y-4">
        <UploaderToolbar
          files={files}
          onUploadAll={handleUploadAll}
          onCancelAll={handleCancelAll}
          onClearAll={handleClearAll}
          uploadMode={uploadMode}
        />

        <FileGrid
          files={files}
          maxCount={maxCount}
          className={className}
          itemClassName={itemClassName}
          accept={accept}
          multiple={multiple}
          showLibraryPicker={showLibraryPicker}
          uploadMode={uploadMode}
          onFileChange={handleFileChange}
          onDelete={handleDelete}
          onLibraryPick={openLibraryModal}
          onReplace={handleReplace}
          onDrop={handleDrop}
        />

        <FileLibraryModal
          isOpen={isLibraryModalOpen}
          onClose={closeLibraryModal}
          onSelect={handleLibrarySelect}
          multiple={multiple}
          maxCount={maxCount}
          accept={accept}
        />
      </div>
    );
  }
);

Uploader.displayName = "Uploader";

export default Uploader;
