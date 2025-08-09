import { ImagePreviewDialog } from "@/components/common/image-preview-dialog";
import { FileItemInfo } from "@/components/common/uploader/types";
import { Button } from "@/components/ui/button";
import { ParameterConfig, ParameterType } from "@/conifg/aigc/types";
import { getObjectUrl } from "@/lib/utils";
import { GitCompareArrows } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useState } from "react";
import { ImageComparisonDialog } from "./ImageComparisonDialog";

/**
 * Parameter renderer interface
 */
export type ParameterRenderer = (props: {
  param: ParameterConfig;
  value: unknown;
  modelMap: Record<string, string>;
  taskMedia?: Array<{ url: string; name: string }>;
  t?: (key: string) => string;
}) => React.ReactNode;

/**
 * Container renderer interface
 */
export type ContainerRenderer = (
  renderers: Array<{
    key: string;
    label: string;
    value: React.ReactNode;
  }>
) => React.ReactNode;

/**
 * Default parameter renderer - concise text format
 */
export const defaultParameterRenderer: ParameterRenderer = ({ param, value, modelMap, t }) => {
  switch (param.type) {
    case ParameterType.TEXT:
      return String(value);
    case ParameterType.NUMBER:
      return `${value}${param.number_unit || ""}`;
    case ParameterType.BOOLEAN:
      return value ? (t ? t("boolean.on") : "On") : t ? t("boolean.off") : "Off";
    case ParameterType.SELECT:
      const option = param.options?.find((opt) => opt.value === value);
      return option ? option.label : String(value);
    case ParameterType.ASPECT_RATIO:
      const aspectRatio = param.aspectRatios?.find((ar) => ar.value === value);
      return aspectRatio ? aspectRatio.label : String(value);
    case ParameterType.MODEL:
      return modelMap[String(value)] || String(value);
    case ParameterType.IMAGES:
      if (Array.isArray(value)) {
        return `${value.length} image(s)`;
      }
      return String(value);
    default:
      return String(value);
  }
};

const ImageParameterRenderer: React.FC<{
  value: unknown;
  taskMedia?: Array<{ url: string; name: string }>;
}> = ({ value, taskMedia }) => {
  const t = useTranslations("ai.common");
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
  const [comparisonState, setComparisonState] = useState<{
    beforeImage: { url: string; name: string };
    afterImage: { url: string; name: string };
  } | null>(null);

  if (!Array.isArray(value)) {
    return <span className="text-foreground">{String(value)}</span>;
  }

  const images = value as FileItemInfo[];

  const handleCompare = (inputImage: { url: string; name: string }) => {
    if (taskMedia && taskMedia.length > 0) {
      setComparisonState({
        beforeImage: inputImage,
        afterImage: taskMedia[0],
      });
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {images.map((image) => {
          const imageUrl = getObjectUrl(image.objectId);
          if (!imageUrl) return null;

          return (
            <div
              key={image.id}
              className="group relative h-20 w-20 overflow-hidden rounded-md border"
            >
              <Image
                src={imageUrl}
                alt={image.name}
                layout="fill"
                objectFit="cover"
                className="transition-transform hover:scale-105"
                unoptimized
              />

              {/* Overlay with actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-white hover:bg-white/20"
                  onClick={() => setPreviewImage({ url: imageUrl, name: image.name })}
                  title={t("imageActions.preview")}
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </Button>

                {taskMedia && taskMedia.length > 0 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-white hover:bg-white/20"
                    onClick={() => handleCompare({ url: imageUrl, name: image.name })}
                    title={t("imageActions.compare")}
                  >
                    <GitCompareArrows className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Dialog */}
      {previewImage && (
        <ImagePreviewDialog
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          imageUrl={previewImage.url}
          fileName={previewImage.name}
        />
      )}

      {/* Comparison Dialog */}
      {comparisonState && (
        <ImageComparisonDialog
          isOpen={!!comparisonState}
          onClose={() => setComparisonState(null)}
          beforeImage={comparisonState.beforeImage}
          afterImage={comparisonState.afterImage}
        />
      )}
    </>
  );
};

/**
 * Styled parameter renderer - for preview window
 */
export const styledParameterRenderer: ParameterRenderer = ({
  param,
  value,
  modelMap,
  taskMedia,
  t,
}) => {
  switch (param.type) {
    case ParameterType.TEXT:
      const textValue = String(value);
      if (textValue.length > 100) {
        return (
          <span title={textValue} className="text-foreground">
            {textValue.substring(0, 100)}...
          </span>
        );
      }
      return <span className="text-foreground">{textValue}</span>;
    case ParameterType.NUMBER:
      return (
        <span className="text-foreground font-mono">
          {String(value)}
          {param.number_unit || ""}
        </span>
      );
    case ParameterType.BOOLEAN:
      return (
        <span
          className={`rounded px-2 py-1 text-xs font-medium ${
            value
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {value ? (t ? t("boolean.on") : "On") : t ? t("boolean.off") : "Off"}
        </span>
      );
    case ParameterType.SELECT:
      const option = param.options?.find((opt) => opt.value === value);
      return (
        <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {option ? option.label : String(value)}
        </span>
      );
    case ParameterType.ASPECT_RATIO:
      const aspectRatio = param.aspectRatios?.find((ar) => ar.value === value);
      return (
        <span className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          {aspectRatio ? aspectRatio.label : String(value)}
        </span>
      );
    case ParameterType.MODEL:
      return (
        <span className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-300">
          {modelMap[String(value)] || String(value)}
        </span>
      );
    case ParameterType.IMAGES:
      return <ImageParameterRenderer value={value} taskMedia={taskMedia} />;
    default:
      return <span className="text-foreground">{String(value)}</span>;
  }
};

/**
 * Compact container renderer - for tooltip
 */
export const compactContainerRenderer: ContainerRenderer = (renderers) => {
  return (
    <>
      {renderers.map((renderer) => (
        <div key={renderer.key} className="text-sm">
          <b>{renderer.label}:</b> {renderer.value}
        </div>
      ))}
    </>
  );
};

/**
 * Card-style container renderer - for preview window
 */
export const cardContainerRenderer: ContainerRenderer = (renderers) => {
  return (
    <div className="space-y-3">
      {renderers.map((renderer) => (
        <div key={renderer.key} className="flex flex-col gap-1">
          <div className="text-muted-foreground text-sm font-medium">{renderer.label}</div>
          <div className="text-sm">{renderer.value}</div>
        </div>
      ))}
    </div>
  );
};

/**
 * Table-style container renderer - for detailed information display
 */
export const tableContainerRenderer: ContainerRenderer = (renderers) => {
  return (
    <div className="space-y-2">
      {renderers.map((renderer) => (
        <div key={renderer.key} className="flex items-start justify-between gap-3 py-1">
          <div className="text-muted-foreground flex-shrink-0 text-sm font-medium">
            {renderer.label}:
          </div>
          <div className="text-right text-sm">{renderer.value}</div>
        </div>
      ))}
    </div>
  );
};
