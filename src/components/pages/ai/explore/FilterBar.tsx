"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ClockIcon, ImageIcon, StarFilledIcon, VideoIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";

interface FilterBarProps {
  type: string;
  onTypeChange: (type: string) => void;
  featured?: boolean;
  onFeaturedChange: (featured: boolean | undefined) => void;
  orderBy: string;
  onOrderByChange: (orderBy: "createdAt" | "featured") => void;
  onReset: () => void;
}

export function FilterBar({
  type,
  onTypeChange,
  featured,
  onFeaturedChange,
  orderBy,
  onOrderByChange,
  onReset,
}: FilterBarProps) {
  const t = useTranslations("explore");

  return (
    <div className="flex flex-col gap-4 rounded-lg">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Type Filter */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-sm font-medium whitespace-nowrap">{t("filters.type")}:</span>
            <ToggleGroup
              type="single"
              value={type}
              onValueChange={(value) => value && onTypeChange(value)}
              variant="outline"
            >
              <ToggleGroupItem value="all" aria-label="All types">
                {t("filters.all")}
              </ToggleGroupItem>
              <ToggleGroupItem value="image" aria-label="Images">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t("filters.images")}</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="video" aria-label="Videos">
                <VideoIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t("filters.videos")}</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Featured Filter */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-sm font-medium whitespace-nowrap">{t("filters.featured")}:</span>
            <ToggleGroup
              type="single"
              value={featured === true ? "featured" : featured === false ? "regular" : "all"}
              onValueChange={(value) => {
                if (value === "featured") onFeaturedChange(true);
                else if (value === "regular") onFeaturedChange(false);
                else onFeaturedChange(undefined);
              }}
              variant="outline"
            >
              <ToggleGroupItem value="all" aria-label="All items">
                {t("filters.all")}
              </ToggleGroupItem>
              <ToggleGroupItem value="featured" aria-label="Featured only">
                <StarFilledIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t("filters.featuredOnly")}</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="regular" aria-label="Regular only">
                <span className="hidden sm:inline">{t("filters.regular")}</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
          {/* Sort Order */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-sm font-medium whitespace-nowrap">{t("filters.sortBy")}:</span>
            <Select
              value={orderBy}
              onValueChange={(value: "createdAt" | "featured") => onOrderByChange(value)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    {t("filters.newest")}
                  </div>
                </SelectItem>
                <SelectItem value="featured">
                  <div className="flex items-center gap-2">
                    <StarFilledIcon className="h-4 w-4" />
                    {t("filters.featured")}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Button */}
          <Button variant="outline" onClick={onReset} className="w-full sm:w-auto">
            {t("filters.reset")}
          </Button>
        </div>
      </div>
    </div>
  );
}
