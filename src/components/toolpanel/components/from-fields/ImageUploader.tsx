import Uploader, { UploaderRef } from "@/components/common/uploader/Uploader";
import { FileItemInfo, UploadMode } from "@/components/common/uploader/types";
import { stripFileItemInfoFields } from "@/components/toolpanel/utils/parameter-utils";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { JsonObject } from "@/types/json";
import { ChevronDown, ChevronUp, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { InfoTooltip } from "@/components/common/ai/InfoTooltip";

export interface ImageUploaderRef {
  upload: () => Promise<void>;
  clear: () => void;
  getFiles: () => FileItemInfo[];
}

interface ImageUploaderProps {
  value?: FileItemInfo[];
  onChange: (files: FileItemInfo[]) => void;
  required?: boolean;
  description?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  imageCount?: number;
  uploadMode?: UploadMode;
  baseMetadata?: JsonObject;
  onUploadComplete?: (files: FileItemInfo[]) => void;
  isPublic?: boolean;
}

export const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(
  (
    {
      value,
      onChange,
      required = false,
      description,
      collapsible = false,
      defaultCollapsed = false,
      imageCount = 1,
      uploadMode = "immediate",
      baseMetadata = {},
      onUploadComplete,
      isPublic = false,
    },
    ref
  ) => {
    const t = useTranslations("ai.common");
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const uploaderRef = useRef<UploaderRef>(null);

    const handleChange = useCallback(
      (files: FileItemInfo[]) => {
        const newFiles = stripFileItemInfoFields(files, baseMetadata);
        onChange(newFiles);
      },
      [onChange, baseMetadata]
    );

    useImperativeHandle(
      ref,
      () => ({
        upload: async () => {
          if (uploaderRef.current) {
            await uploaderRef.current.upload();
            const updatedFiles = uploaderRef.current.getFiles();
            handleChange(updatedFiles);
          }
        },
        clear: () => {
          if (uploaderRef.current) {
            uploaderRef.current.clear();
          }
        },
        getFiles: () => {
          if (uploaderRef.current) {
            return uploaderRef.current.getFiles();
          }
          return [];
        },
      }),
      [handleChange]
    );

    return (
      <div
        className={cn(
          "space-y-2 rounded-xl p-2 shadow-md shadow-black/15 dark:shadow-white/20",
          isCollapsed && "cursor-pointer"
        )}
        onClick={isCollapsed ? () => setIsCollapsed(false) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Upload className="text-primary h-4 w-4" />
            <Label htmlFor="image" className="block text-left text-sm">
              {t("image")}
              {required && <span className="text-red-500">*</span>}
            </Label>
            {description && <InfoTooltip content={description} />}
          </div>
          {collapsible && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
              }}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {!isCollapsed && (
          <Uploader
            ref={uploaderRef}
            accept="image/*"
            maxCount={imageCount}
            multiple={imageCount > 1}
            uploadMode={uploadMode}
            itemClassName="w-full h-40 min-h-24 md:min-h-32"
            isPublic={isPublic}
            value={value}
            onSubmit={uploadMode === "submit" ? onUploadComplete : undefined}
            onChange={handleChange}
          />
        )}
      </div>
    );
  }
);

ImageUploader.displayName = "ImageUploader";
