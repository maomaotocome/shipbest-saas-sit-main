import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";
import React from "react";
import { FileItemInfo } from "./types";

interface ReplaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReplace: () => void;
  currentFile?: FileItemInfo;
  newFile?: File;
}

export const ReplaceDialog: React.FC<ReplaceDialogProps> = ({
  isOpen,
  onClose,
  onReplace,
  currentFile,
  newFile,
}) => {
  const t = useTranslations("uploader.replaceDialog");

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("description", { current: currentFile?.name || "", new: newFile?.name || "" })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onReplace}>{t("confirm")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
