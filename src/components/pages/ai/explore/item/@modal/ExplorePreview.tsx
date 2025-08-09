"use client";
import { downloadMedia } from "@/components/common/ai/download";
import { MediaPreviewDialog } from "@/components/common/ai/MediaPreview/MediaPreviewDialog";
import { PreviewParameterDisplay } from "@/components/common/ai/PreviewParameterDisplay";
import { SocialShare } from "@/components/common/social/SocialShare";
import { Button } from "@/components/ui/button";
import { TaskType } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { DownloadIcon, ReloadIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ExploreItem } from "../../types";
import { createMediaItems, parseOriginalRequest } from "../../utils";
interface ExplorePreviewProps {
  item: ExploreItem;
  isOpen: boolean;
  onClose: () => void;
  onRecreate: () => void;
}

export function ExplorePreview({ item, isOpen, onClose, onRecreate }: ExplorePreviewProps) {
  const t = useTranslations("explore");

  if (!item || !isOpen) {
    return null;
  }

  const mediaItems = createMediaItems(item);
  const parsedRequest = parseOriginalRequest(item.originalRequest);

  const headerContent = (
    <div>
      <h3 className="text-foreground mb-2 font-medium">{t("preview.creatorInformation")}</h3>
      <div className="flex items-center gap-3 text-sm">
        {item.user?.image && (
          <Image
            src={item.user.image}
            alt={item.user.name || "User"}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <div className="text-foreground font-medium">{item.user?.name || "Anonymous"}</div>
        </div>
      </div>
    </div>
  );

  const footerContent = (
    <div className="border-t pt-4">
      <h3 className="text-foreground mb-3 font-medium">{t("preview.fileInformation")}</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("preview.type")}:</span>
          <span className="capitalize">{item.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("preview.dimensions")}:</span>
          <span className="font-mono">
            {item.width} × {item.height}
          </span>
        </div>
        {item.featured && (
          <div className="flex items-center gap-1 text-yellow-600">
            <StarFilledIcon className="h-3 w-3" />
            <span className="text-xs">{t("preview.featured")}</span>
          </div>
        )}
      </div>
    </div>
  );

  const sidebar = (
    <div className="space-y-4">
      <PreviewParameterDisplay
        header={headerContent}
        footer={footerContent}
        taskType={item.taskType as TaskType}
        metadata={item.originalMetadata as JsonObject}
        request={parsedRequest}
        taskMedia={[
          {
            url: item.publicUrl,
            name: `explore-${item.id}.${item.type === "video" ? "mp4" : "jpg"}`,
          },
        ]}
      />

      <div className="space-y-3 px-4">
        <h3 className="text-foreground font-medium">{t("preview.actions")}</h3>

        <Button
          onClick={() =>
            downloadMedia({
              sourceUrl: item.publicUrl,
              fileName: `explore-${item.id}.${item.type === "video" ? "mp4" : "jpg"}`,
            })
          }
          className="w-full"
          variant="default"
        >
          <DownloadIcon className="mr-2 h-4 w-4" />
          {t("preview.download")}
        </Button>

        {item.originalRequest && (
          <Button onClick={onRecreate} className="w-full" variant="outline">
            <ReloadIcon className="mr-2 h-4 w-4" />
            {t("preview.recreate")}
          </Button>
        )}

        <div className="mt-4">
          <h4 className="text-foreground mb-2 font-medium">{t("preview.share")}</h4>
          <SocialShare
            title={`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} - ${item.user?.name || "Anonymous"}`}
            description={`Check out this ${item.type} created with AI`}
          />
        </div>
      </div>
    </div>
  );

  return (
    <MediaPreviewDialog isOpen={isOpen} onClose={onClose} items={mediaItems} sidebar={sidebar} />
  );
}
