"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Locale } from "@/i18n/locales";
import { cn } from "@/lib/utils";
import { calculateTaskCredits, CreditCalculationResult } from "@/services/tasks/credit";
import type { JsonObject } from "@/types/json";
import { ChevronDown, ChevronUp, Coins, Info } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { getImageToImageModels } from "@/conifg/aigc/model-direct-invocation/image-to-image";
import { getImageToVideoModels } from "@/conifg/aigc/model-direct-invocation/image-to-video";
import { getTextToImageModels } from "@/conifg/aigc/model-direct-invocation/text-to-image";
import { getTextToMusicModels } from "@/conifg/aigc/model-direct-invocation/text-to-music";
import { getTextToVideoModels } from "@/conifg/aigc/model-direct-invocation/text-to-video";
import { getTemplates } from "@/conifg/aigc/template";
import { TaskType } from "@/lib/constants";

interface CreditDisplayProps {
  taskType: TaskType;
  metadata: JsonObject;
  request: JsonObject;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function CreditDisplay({
  taskType,
  metadata,
  request,
  className,
  collapsible = false,
  defaultCollapsed = false,
}: CreditDisplayProps) {
  const t = useTranslations("ai.common");
  const locale = useLocale() as Locale;
  const [creditResult, setCreditResult] = useState<CreditCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // get model code to name map
  const modelMap: Record<string, string> = {};

  // text-to-image
  getTextToImageModels(locale).forEach((m) => {
    modelMap[m.code] = m.name;
  });
  // image-to-image
  getImageToImageModels(locale).forEach((m) => {
    modelMap[m.code] = m.name;
  });
  // text-to-video
  getTextToVideoModels(locale).forEach((m) => {
    modelMap[m.code] = m.name;
  });
  // image-to-video
  getImageToVideoModels(locale).forEach((m) => {
    modelMap[m.code] = m.name;
  });
  // text-to-music
  getTextToMusicModels(locale).forEach((m) => {
    modelMap[m.code] = m.name;
  });
  // templates
  getTemplates(locale).forEach((t) => {
    modelMap[t.code] = t.name;
  });

  useEffect(() => {
    const calculateCredits = async () => {
      // check if required parameters exist
      if (!taskType || !request) {
        setCreditResult(null);
        return;
      }

      // check if other required parameters exist
      const hasRequiredParams = checkRequiredParams(taskType, request, metadata);
      if (!hasRequiredParams) {
        setCreditResult(null);
        return;
      }

      setError(null);

      try {
        const result = await calculateTaskCredits({
          taskType,
          request,
          metadata,
        });
        setCreditResult(result);
      } catch (err) {
        console.error("Failed to calculate credits:", err);
        setError(err instanceof Error ? err.message : t("calculationError"));
        setCreditResult(null);
      }
    };

    calculateCredits();
  }, [taskType, request, metadata, t]);

  // check if required parameters are complete
  const checkRequiredParams = (
    taskType: TaskType,
    request: JsonObject,
    metadata: JsonObject
  ): boolean => {
    switch (taskType) {
      case TaskType.ModelDirectInvocation:
        // For model direct invocation, check if model is specified
        return !!(
          metadata.model_category ||
          (metadata.models && Array.isArray(metadata.models) && metadata.models.length > 0)
        );
      case TaskType.Template:
        return !!metadata.template_type;

      default:
        return false;
    }
  };

  if (error) {
    return (
      <div
        className={cn(
          "space-y-2 rounded-xl p-2 shadow-md shadow-black/15 dark:shadow-white/20",
          isCollapsed && "cursor-pointer",
          className
        )}
        onClick={isCollapsed ? () => setIsCollapsed(false) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-red-600" />
            <Label className="block text-left text-sm text-red-600">{t("calculationError")}</Label>
          </div>
          {collapsible && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
              }}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {!isCollapsed && (
          <div className="flex items-center justify-center p-4">
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}
      </div>
    );
  }

  if (!creditResult) {
    return (
      <div
        className={cn(
          "space-y-2 rounded-xl p-2 shadow-md shadow-black/15 dark:shadow-white/20",
          isCollapsed && "cursor-pointer",
          className
        )}
        onClick={isCollapsed ? () => setIsCollapsed(false) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins className="text-primary h-4 w-4" />
            <Label className="block text-left text-sm">{t("creditPreview")}</Label>
          </div>
          {collapsible && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
              }}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
        {!isCollapsed && (
          <div className="flex items-center justify-center p-4">
            <span className="text-muted-foreground text-sm">{t("fillParameters")}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl p-2 shadow-md shadow-black/15 dark:shadow-white/20",
        className
      )}
      onClick={isCollapsed ? () => setIsCollapsed(false) : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Coins className="text-primary h-4 w-4" />
          <Label className="block text-left text-sm">{t("creditPreview")}</Label>
        </div>
        {collapsible && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t("totalCredits")}</span>
            {creditResult.breakdown.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex cursor-pointer align-middle">
                    <Info className="text-muted-foreground hover:text-primary h-3.5 w-3.5 transition-colors" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-[280px] space-y-2 text-xs">
                    <div className="font-medium">{t("creditDetails")}</div>
                    {creditResult.breakdown.map((item, index) => (
                      <div
                        key={index}
                        className="border-border/50 flex items-center justify-between border-b border-gray-200 pb-1 last:border-b-0"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{modelMap[item.model] || item.model}</span>
                          <span className="text-muted-foreground">
                            {t("quantity")}: {item.quantity}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.credits}
                        </Badge>
                      </div>
                    ))}
                    <div className="text-muted-foreground border-border/50 mt-2 pt-2 text-xs">
                      {t("estimatedConsumption")}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <Badge variant="secondary" className="text-base font-semibold">
            {creditResult.totalCredits}
          </Badge>
        </div>
      )}
    </div>
  );
}
