import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { useTranslations } from "next-intl";

interface ItemActionButtonsProps {
  onDownload: (e: React.MouseEvent) => void;
  onRecreate: (e: React.MouseEvent) => void;
  showRecreate: boolean;
  downloadTitle?: string;
  recreateTitle?: string;
}

export function ItemActionButtons({
  onDownload,
  onRecreate,
  showRecreate,
  downloadTitle,
  recreateTitle,
}: ItemActionButtonsProps) {
  const tActions = useTranslations("ai.common.actions");

  return (
    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 transition-opacity group-hover/item:opacity-100">
      <Button
        size="sm"
        variant="secondary"
        className="h-6 w-6 p-0"
        onClick={onDownload}
        title={downloadTitle ?? tActions("downloadOriginal")}
        aria-label={downloadTitle ?? tActions("downloadOriginal")}
      >
        <Download className="h-3 w-3" />
      </Button>

      {showRecreate && (
        <Button
          size="sm"
          variant="secondary"
          className="h-6 w-6 p-0"
          onClick={onRecreate}
          title={recreateTitle ?? tActions("recreateTask")}
          aria-label={recreateTitle ?? tActions("recreateTask")}
        >
          <Copy className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
