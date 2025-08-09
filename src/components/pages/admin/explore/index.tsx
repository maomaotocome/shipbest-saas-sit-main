"use client";

import { getExploreItemStatsAction } from "@/actions/admin/explore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExploreItemStatus } from "@/db/generated/prisma";
import { useDebounce } from "@/hooks/use-debounce";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ExploreItemsTable } from "./ExploreItemsTable";
import { PublicTasksTable } from "./PublicTasksTable";
import { StatsCards } from "./StatsCards";

const PAGE_SIZE = 20;

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  hidden: number;
  visible: number;
  featured: number;
}

function StatsSection() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const result = await getExploreItemStatsAction();
        setStats(result);
        setError(false);
      } catch (err) {
        console.error("Failed to load stats:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive text-sm">Failed to load stats</p>
        </CardContent>
      </Card>
    );
  }

  return <StatsCards stats={stats} />;
}

export default function ExploreAdminPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("items");
  
  // 探索项目筛选状态
  const [statusFilter, setStatusFilter] = useState<ExploreItemStatus | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("ALL");
  const [featuredFilter, setFeaturedFilter] = useState<string>("ALL");
  const [itemsPage, setItemsPage] = useState(1);
  
  // 公开任务筛选状态
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>("ALL");
  const [taskSearchInput, setTaskSearchInput] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [tasksPage, setTasksPage] = useState(1);
  
  const debouncedTaskSearch = useDebounce(taskSearch, 300);
  
  const t = useTranslations("admin.explore");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTaskSearch = () => {
    setTaskSearch(taskSearchInput);
    setTasksPage(1);
  };

  const handleTaskSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTaskSearch();
    }
  };

  const resetItemsFilters = () => {
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setVisibilityFilter("ALL");
    setFeaturedFilter("ALL");
    setItemsPage(1);
  };

  const resetTasksFilters = () => {
    setTaskTypeFilter("ALL");
    setTaskSearchInput("");
    setTaskSearch("");
    setTasksPage(1);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <StatsSection />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items">{t("tabs.items")}</TabsTrigger>
          <TabsTrigger value="add">{t("tabs.addFromTasks")}</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("items.filters.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                <div className="space-y-2">
                  <Label>{t("items.filters.status")}</Label>
                  <Select value={statusFilter} onValueChange={(value) => {
                    setStatusFilter(value as ExploreItemStatus | "ALL");
                    setItemsPage(1);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">{t("items.filters.allStatuses")}</SelectItem>
                      <SelectItem value={ExploreItemStatus.PENDING}>{t("items.status.pending")}</SelectItem>
                      <SelectItem value={ExploreItemStatus.APPROVED}>{t("items.status.approved")}</SelectItem>
                      <SelectItem value={ExploreItemStatus.REJECTED}>{t("items.status.rejected")}</SelectItem>
                      <SelectItem value={ExploreItemStatus.HIDDEN}>{t("items.status.hidden")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("items.filters.type")}</Label>
                  <Select value={typeFilter} onValueChange={(value) => {
                    setTypeFilter(value);
                    setItemsPage(1);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">{t("items.filters.allTypes")}</SelectItem>
                      <SelectItem value="image">{t("items.type.image")}</SelectItem>
                      <SelectItem value="video">{t("items.type.video")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("items.filters.visibility")}</Label>
                  <Select value={visibilityFilter} onValueChange={(value) => {
                    setVisibilityFilter(value);
                    setItemsPage(1);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">{t("items.filters.allVisibility")}</SelectItem>
                      <SelectItem value="true">{t("items.visibility.visible")}</SelectItem>
                      <SelectItem value="false">{t("items.visibility.hidden")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("items.filters.featured")}</Label>
                  <Select value={featuredFilter} onValueChange={(value) => {
                    setFeaturedFilter(value);
                    setItemsPage(1);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">{t("items.filters.allFeatured")}</SelectItem>
                      <SelectItem value="true">{t("items.featured.yes")}</SelectItem>
                      <SelectItem value="false">{t("items.featured.no")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={resetItemsFilters} variant="outline" size="sm">
                    {t("items.filters.reset")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <ExploreItemsTable
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            visibilityFilter={visibilityFilter}
            featuredFilter={featuredFilter}
            page={itemsPage}
            setPage={setItemsPage}
            pageSize={PAGE_SIZE}
          />
        </TabsContent>

        <TabsContent value="add" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("tasks.filters.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label>{t("tasks.filters.taskType")}</Label>
                  <Select value={taskTypeFilter} onValueChange={(value) => {
                    setTaskTypeFilter(value);
                    setTasksPage(1);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("tasks.filters.allTaskTypes")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">{t("tasks.filters.allTaskTypes")}</SelectItem>
                      <SelectItem value="text-to-image">{t("tasks.taskType.textToImage")}</SelectItem>
                      <SelectItem value="image-to-image">{t("tasks.taskType.imageToImage")}</SelectItem>
                      <SelectItem value="text-to-video">{t("tasks.taskType.textToVideo")}</SelectItem>
                      <SelectItem value="image-to-video">{t("tasks.taskType.imageToVideo")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <Label>{t("tasks.filters.search")}</Label>
                  <Input
                    placeholder={t("tasks.filters.searchPlaceholder")}
                    value={taskSearchInput}
                    onChange={(e) => setTaskSearchInput(e.target.value)}
                    onKeyDown={handleTaskSearchKeyDown}
                  />
                </div>

                <Button onClick={handleTaskSearch} className="shrink-0">
                  <MagnifyingGlassIcon className="mr-2 h-4 w-4" />
                  {t("tasks.filters.searchButton")}
                </Button>

                <Button onClick={resetTasksFilters} variant="outline" className="shrink-0">
                  {t("tasks.filters.reset")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <PublicTasksTable
            taskTypeFilter={taskTypeFilter}
            searchFilter={debouncedTaskSearch}
            page={tasksPage}
            setPage={setTasksPage}
            pageSize={PAGE_SIZE}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}