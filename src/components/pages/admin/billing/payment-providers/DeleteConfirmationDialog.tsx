"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  itemName?: string;
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  itemName,
}: DeleteConfirmationDialogProps) {
  const t = useTranslations("admin.billing.payment-providers");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("deleteConfirmation.title", { name: itemName ?? "" })}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-500">
            {itemName
              ? t("deleteConfirmation.messageWithName", { name: itemName ?? "" })
              : t("deleteConfirmation.message")}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? t("deleting") : t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
