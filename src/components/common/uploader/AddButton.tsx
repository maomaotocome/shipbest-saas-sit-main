import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

interface AddButtonProps {
  className?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  multiple?: boolean;
}

export const AddButton: React.FC<AddButtonProps> = ({ className, onChange, accept, multiple }) => {
  const t = useTranslations("uploader");

  return (
    <div
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg",
        className
      )}
    >
      <label className="flex cursor-pointer flex-col items-center gap-2">
        <input
          type="file"
          className="hidden"
          onChange={onChange}
          accept={accept}
          multiple={multiple}
        />
        <Plus className="h-8 w-8 text-gray-400" />
        <span className="text-sm text-gray-500">{t("addButton.addFile")}</span>
      </label>
    </div>
  );
};
