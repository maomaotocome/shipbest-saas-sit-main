import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UseMutationResult } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { MediaItem } from "./types";

interface MediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItems: MediaItem[];
  addToExplore: UseMutationResult<
    unknown,
    Error,
    {
      taskId: string;
      subTaskId: string;
      index: number;
    },
    unknown
  >;
}

export function MediaDialog({ isOpen, onClose, mediaItems, addToExplore }: MediaDialogProps) {
  const t = useTranslations("admin.explore.tasks");

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("selectMediaItems")}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mediaItems.map((item, idx) => (
            <div key={idx} className="space-y-2 rounded-lg border p-4">
              <div className="aspect-video overflow-hidden rounded bg-gray-100">
                {item.type === "image" ? (
                  <Image
                    src={item.url}
                    alt={`Media ${idx + 1}`}
                    width={item.width || 400}
                    height={item.height || 300}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video src={item.url} className="h-full w-full object-cover" autoPlay loop />
                )}
              </div>
              <div className="text-sm text-gray-600">
                <div>Type: {item.type}</div>
                {item.width && item.height && (
                  <div>
                    Size: {item.width}x{item.height}
                  </div>
                )}
              </div>
              <Button
                size="sm"
                onClick={() =>
                  addToExplore.mutate({
                    taskId: item.taskId,
                    subTaskId: item.subTaskId,
                    index: item.index,
                  })
                }
                disabled={addToExplore.isPending}
                className="w-full"
              >
                {t("addThisItem")}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
