"use client";

import { downloadMedia } from "@/components/common/ai/download";
import { PreviewParameterDisplay } from "@/components/common/ai/PreviewParameterDisplay";
import { useRecreateTask } from "@/components/common/ai/RecreateTaskProvider";
import { SocialShare } from "@/components/common/social/SocialShare";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TaskType } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { DownloadIcon, ReloadIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef, useState } from "react";
import { ExploreItem } from "../../types";
import { createInvokerConfig, parseOriginalRequest } from "../../utils";

export function ExploreItemDetail({ item }: { item: ExploreItem }) {
  const t = useTranslations("explore");
  const { openRecreateDialog } = useRecreateTask();
  const [showControls, setShowControls] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const parsedRequest = parseOriginalRequest(item.originalRequest);
  const invokerConfig = createInvokerConfig(item);

  const handleRecreate = () => {
    if (invokerConfig) {
      openRecreateDialog(
        invokerConfig,
        parsedRequest as JsonObject,
        item.type as "image" | "video"
      );
    }
  };

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

  return (
    <div className="container mx-auto pt-30 pb-8">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/explore">{t("title")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("preview.details")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Media Display */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardContent className="border-none p-0">
              <div
                className="flex items-center justify-center overflow-hidden rounded-lg bg-gray-100"
                style={{ aspectRatio: `${item.width} / ${item.height}` }}
              >
                {item.type === "image" ? (
                  <Image
                    src={item.publicUrl}
                    alt={`${item.type} - ${item.id}`}
                    width={item.width}
                    height={item.height}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <video
                    src={item.publicUrl}
                    controls={showControls}
                    className="h-full w-full object-contain"
                    preload="metadata"
                    autoPlay
                    loop
                    onMouseEnter={() => {
                      if (hideTimeoutRef.current) {
                        clearTimeout(hideTimeoutRef.current);
                      }
                      setShowControls(true);
                    }}
                    onMouseLeave={() => {
                      hideTimeoutRef.current = setTimeout(() => {
                        setShowControls(false);
                      }, 3000);
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{item.type.toUpperCase()}</Badge>
                  <span className="text-muted-foreground text-sm">
                    {item.width} × {item.height}
                  </span>
                  {item.featured && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <StarFilledIcon className="h-3 w-3" />
                      <span className="text-xs">{t("preview.featured")}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      downloadMedia({
                        sourceUrl: item.publicUrl,
                        fileName: `explore-${item.id}.${item.type === "video" ? "mp4" : "jpg"}`,
                      })
                    }
                    variant="outline"
                    size="sm"
                  >
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    {t("preview.download")}
                  </Button>
                  {invokerConfig && (
                    <Button onClick={handleRecreate} variant="outline" size="sm">
                      <ReloadIcon className="mr-2 h-4 w-4" />
                      {t("preview.recreate")}
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <SocialShare
                  title={`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} - ${item.user?.name || "Anonymous"}`}
                  description={`Check out this ${item.type} created with AI`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Sidebar */}
        <div className="space-y-4">
          {/* Creator Information */}
          <Card>
            <CardContent className="p-4">{headerContent}</CardContent>
          </Card>

          {/* Parameter Display */}
          <Card>
            <CardContent className="p-4">
              <PreviewParameterDisplay
                header={null}
                footer={footerContent}
                taskType={item.taskType as TaskType}
                metadata={item.originalMetadata as JsonObject}
                request={parsedRequest}
                taskMedia={[{
                  url: item.publicUrl,
                  name: `explore-${item.id}.${item.type === "video" ? "mp4" : "jpg"}`
                }]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
