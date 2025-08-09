import React from "react";
import { Camera, FolderOpen } from "lucide-react";
import { useTranslations } from "next-intl";

interface EmptyStateProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLibraryPick: () => void;
  accept?: string;
  showLibraryPicker?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onUpload,
  onLibraryPick,
  accept,
  showLibraryPicker,
}) => {
  const t = useTranslations("uploader");

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <label className="cursor-pointer rounded-full p-1 hover:bg-gray-100">
          <input
            type="file"
            className="hidden"
            onChange={onUpload}
            accept={accept}
          />
          <Camera className="h-6 w-6 text-gray-400" />
        </label>
        {showLibraryPicker && (
          <button
            onClick={onLibraryPick}
            className="rounded-full p-1 hover:bg-gray-100"
            title={t("fileActions.selectFromLibrary")}
          >
            <FolderOpen className="h-6 w-6 text-gray-400" />
          </button>
        )}
      </div>
      <span className="text-sm text-gray-500">
        {t("emptyState.uploadOrSelect")}
      </span>
    </div>
  );
};
