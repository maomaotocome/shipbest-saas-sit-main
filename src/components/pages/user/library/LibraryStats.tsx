"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StorageObjectSource } from "@/lib/constants";
import { MediaType } from "@/lib/types/media-metadata";
import { FileAudio, Files, FileText, HardDrive, Image as ImageIcon, Video } from "lucide-react";
import { useTranslations } from "next-intl";

interface LibraryStatsProps {
  stats: {
    totalObjects: number;
    totalSize: number;
    bySource: Record<StorageObjectSource, number>;
    byMediaType: Record<MediaType, number>;
  };
}

export function LibraryStats({ stats }: LibraryStatsProps) {
  const t = useTranslations();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  const getMediaTypeIcon = (mediaType: MediaType) => {
    switch (mediaType) {
      case MediaType.IMAGE:
        return <ImageIcon className="h-4 w-4" />;
      case MediaType.VIDEO:
        return <Video className="h-4 w-4" />;
      case MediaType.AUDIO:
        return <FileAudio className="h-4 w-4" />;
      case MediaType.DOCUMENT:
        return <FileText className="h-4 w-4" />;
      default:
        return <Files className="h-4 w-4" />;
    }
  };

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Total Files */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("user.library.stats.total_files")}
          </CardTitle>
          <Files className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalObjects.toLocaleString()}</div>
          <p className="text-muted-foreground text-xs">{t("user.library.stats.files_stored")}</p>
        </CardContent>
      </Card>

      {/* Total Size */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("user.library.stats.total_size")}
          </CardTitle>
          <HardDrive className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
          <p className="text-muted-foreground text-xs">{t("user.library.stats.storage_used")}</p>
        </CardContent>
      </Card>

      {/* Source Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("user.library.stats.by_source")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">{t("user.library.uploaded")}</span>
              <Badge variant="secondary">{stats.bySource[StorageObjectSource.USER_UPLOAD]}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">{t("user.library.generated")}</span>
              <Badge variant="default">{stats.bySource[StorageObjectSource.USER_GENERATED]}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Type Breakdown */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t("user.library.stats.by_type")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {Object.entries(stats.byMediaType).map(([mediaType, count]) => (
              <div key={mediaType} className="flex items-center gap-2">
                {getMediaTypeIcon(mediaType as MediaType)}
                <div className="flex-1">
                  <div className="text-sm font-medium capitalize">{mediaType.toLowerCase()}</div>
                  <div className="text-muted-foreground text-xs">
                    {count} {t("user.library.stats.files")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
