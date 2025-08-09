"use client";

import { getLibraryObjectsAction, getLibraryStatsAction } from "@/actions/library";
import { MediaPreviewProvider } from "@/components/common/ai/MediaPreview/MediaPreviewProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LibraryObject } from "@/db/library";
import { StorageObjectSource } from "@/lib/constants";
import { MediaType } from "@/lib/types/media-metadata";
import { Grid, List, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { LibraryGridView } from "./LibraryGridView";
import { LibraryListView } from "./LibraryListView";
import { LibraryStats } from "./LibraryStats";

type ViewMode = "grid" | "list";

interface LibraryFilter {
  source?: StorageObjectSource;
  mediaType?: MediaType;
  hasTaskInfo?: boolean;
  search?: string;
}

export default function LibraryPage() {
  const t = useTranslations();
  const [objects, setObjects] = useState<LibraryObject[]>([]);
  const [stats, setStats] = useState<{
    totalObjects: number;
    totalSize: number;
    bySource: Record<StorageObjectSource, number>;
    byMediaType: Record<MediaType, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<LibraryFilter>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const loadData = useCallback(
    async (reset = false) => {
      try {
        if (reset) {
          setLoading(true);
          setPage(1);
        } else {
          setLoadingMore(true);
        }

        const currentPage = reset ? 1 : page;
        const currentFilter = { ...filter };
        if (searchTerm.trim()) {
          currentFilter.search = searchTerm.trim();
        }

        const result = await getLibraryObjectsAction(currentFilter, currentPage, 20);

        if (reset) {
          setObjects(result.objects);
        } else {
          setObjects((prev) => [...prev, ...result.objects]);
        }

        setHasNext(result.hasNext);

        if (!reset) {
          setPage((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Failed to load library objects:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filter, searchTerm, page]
  );

  const loadStats = useCallback(async () => {
    try {
      const statsData = await getLibraryStatsAction();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load library stats:", error);
    }
  }, []);

  useEffect(() => {
    loadData(true);
    loadStats();
  }, [filter]); // loadData and loadStats are stable due to useCallback

  const handleSearch = useCallback(() => {
    loadData(true);
  }, [loadData]);

  const handleFilterChange = useCallback(
    (key: keyof LibraryFilter, value: string | boolean | undefined) => {
      setFilter((prev) => ({
        ...prev,
        [key]: value === "all" ? undefined : value,
      }));
    },
    []
  );

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasNext) {
      loadData(false);
    }
  }, [loadData, loadingMore, hasNext]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <MediaPreviewProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("user.menu.library")}</h1>
            <p className="text-muted-foreground mt-1">{t("user.library.description")}</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && <LibraryStats stats={stats} />}

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder={t("user.library.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyPress}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={filter.source || "all"}
            onValueChange={(value) => handleFilterChange("source", value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("user.library.filter_by_source")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("user.library.all_sources")}</SelectItem>
              <SelectItem value={StorageObjectSource.USER_UPLOAD}>
                {t("user.library.user_upload")}
              </SelectItem>
              <SelectItem value={StorageObjectSource.USER_GENERATED}>
                {t("user.library.user_generated")}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.mediaType || "all"}
            onValueChange={(value) => handleFilterChange("mediaType", value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("user.library.filter_by_type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("user.library.all_types")}</SelectItem>
              <SelectItem value={MediaType.IMAGE}>{t("user.library.images")}</SelectItem>
              <SelectItem value={MediaType.VIDEO}>{t("user.library.videos")}</SelectItem>
              <SelectItem value={MediaType.AUDIO}>{t("user.library.audio")}</SelectItem>
              <SelectItem value={MediaType.DOCUMENT}>{t("user.library.documents")}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={
              filter.hasTaskInfo === undefined
                ? "all"
                : filter.hasTaskInfo
                  ? "with_task"
                  : "without_task"
            }
            onValueChange={(value) => {
              const hasTaskInfo = value === "all" ? undefined : value === "with_task";
              handleFilterChange("hasTaskInfo", hasTaskInfo);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("user.library.filter_by_task")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("user.library.all_items")}</SelectItem>
              <SelectItem value="with_task">{t("user.library.with_task_info")}</SelectItem>
              <SelectItem value="without_task">{t("user.library.without_task_info")}</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleSearch} size="sm">
            {t("user.library.search")}
          </Button>
        </div>

        {/* Content */}
        {objects.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">{t("user.library.no_objects")}</p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <LibraryGridView objects={objects} />
            ) : (
              <LibraryListView objects={objects} />
            )}

            {/* Load More */}
            {hasNext && (
              <div className="flex justify-center pt-6">
                <Button onClick={handleLoadMore} disabled={loadingMore} variant="outline">
                  {loadingMore ? t("user.library.loading") : t("user.library.load_more")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </MediaPreviewProvider>
  );
}
