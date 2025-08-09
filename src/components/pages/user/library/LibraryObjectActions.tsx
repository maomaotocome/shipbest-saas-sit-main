"use client";

import { downloadMedia } from "@/components/common/ai/download";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LibraryObject } from "@/db/library";
import { Copy, Download, ExternalLink, MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

interface LibraryObjectActionsProps {
  object: LibraryObject;
}

export function LibraryObjectActions({ object }: LibraryObjectActionsProps) {
  const t = useTranslations();

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadMedia({
      originalObjectId: object.originalObjectId || object.id,
      compressedObjectId: object.processedObjectId,
      sourceUrl: object.publicUrl || `/api/oss/object/${object.id}`,
      fileName: object.originName,
    });
  };

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = object.publicUrl || `${window.location.origin}/api/oss/object/${object.id}`;

    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("user.library.url_copied"));
    } catch {
      toast.error(t("user.library.copy_failed"));
    }
  };

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = object.publicUrl || `/api/oss/object/${object.id}`;
    window.open(url, "_blank");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-white hover:bg-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          {t("user.library.download")}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCopyUrl}>
          <Copy className="mr-2 h-4 w-4" />
          {t("user.library.copy_url")}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleOpenInNewTab}>
          <ExternalLink className="mr-2 h-4 w-4" />
          {t("user.library.open_in_new_tab")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
