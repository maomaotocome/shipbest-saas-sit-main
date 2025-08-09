import { Locale } from "@/i18n/locales";
import { TaskType } from "@/lib/constants";
import { JsonObject } from "@/types/json";
import { useTranslations as useIntlTranslations, useLocale } from "next-intl";
import React from "react";
import { DynamicParameterDisplay, useTaskParameterConfig } from "./DynamicParameterDisplay";
import { cardContainerRenderer, styledParameterRenderer } from "./ParameterRenderers";

interface PreviewParameterDisplayProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  taskType: TaskType;
  metadata?: JsonObject;
  request: Record<string, unknown>;
  taskMedia?: Array<{ url: string; name: string }>;
}

interface MetadataDisplayProps {
  metadata: unknown;
  modelMap: Record<string, string>;
}

function MetadataDisplay({ metadata, modelMap }: MetadataDisplayProps) {
  const tTask = useIntlTranslations("task");

  // Ensure metadata is an object and not empty
  if (!metadata || typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
    return null;
  }

  if (Object.keys(metadata).length === 0) {
    return null;
  }

  const formatValue = (value: unknown, key?: string): string => {
    if (value === null || value === undefined) {
      return "-";
    }
    if (typeof value === "boolean") {
      return value ? tTask("metadata.true") : tTask("metadata.false");
    }
    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }

    // Handle model-related field name conversion
    if (key === "model" && typeof value === "string") {
      return modelMap[value] || value;
    }

    return String(value);
  };

  const renderMetadataItem = (key: string, value: unknown) => {
    // Special handling for known metadata fields
    let displayKey = key;
    let displayValue = formatValue(value, key);

    switch (key) {
      case "template_type":
        displayKey = tTask("metadata.labels.templateType");
        displayValue = value ? tTask(`templateType.${value}`) : displayValue;
        break;
      case "model_category":
        displayKey = tTask("metadata.labels.modelCategory");
        displayValue = value ? tTask(`modelCategory.${value}`) : displayValue;
        break;
      case "model":
        displayKey = tTask("metadata.labels.model");
        // displayValue already handled model name conversion in formatValue
        break;
      case "models":
        displayKey = tTask("metadata.labels.models");
        if (Array.isArray(value)) {
          // For model arrays, also need to convert each model's name
          const modelNames = value.map((model) =>
            typeof model === "string" ? modelMap[model] || model : String(model)
          );
          displayValue = modelNames.join(", ");
        }
        break;
      case "is_public":
        displayKey = tTask("metadata.labels.isPublic");
        break;
      default:
        // Keep original key but try to capitalize first letter
        displayKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
    }

    return (
      <div key={key} className="grid grid-cols-3 gap-2 text-sm">
        <div className="text-muted-foreground truncate font-medium" title={displayKey}>
          {displayKey}
        </div>
        <div className="text-foreground col-span-2 break-words">{displayValue}</div>
      </div>
    );
  };

  return (
    <div className="border-b pb-3">
      <h3 className="text-foreground mb-2 font-medium">{tTask("preview.metadata")}</h3>
      <div className="space-y-2">
        {Object.entries(metadata).map(([key, value]) => renderMetadataItem(key, value))}
      </div>
    </div>
  );
}

export function PreviewParameterDisplay({
  header,
  footer,
  taskType,
  metadata,
  request,
  taskMedia,
}: PreviewParameterDisplayProps) {
  const tTask = useIntlTranslations("task");
  const locale = useLocale() as Locale;

  const { parameters, modelMap } = useTaskParameterConfig({
    taskType,
    metadata: metadata || {},
    locale,
  });

  return (
    <div className="space-y-4 p-4">
      {header && <div className="border-b pb-3">{header}</div>}
      
      {metadata ? <MetadataDisplay metadata={metadata} modelMap={modelMap} /> : null}

      {parameters.length > 0 && (
        <div>
          <h3 className="text-foreground mb-3 font-medium">{tTask("preview.parameters")}</h3>
          <DynamicParameterDisplay
            parameters={parameters}
            request={request}
            modelMap={modelMap}
            customRenderer={styledParameterRenderer}
            containerRenderer={cardContainerRenderer}
            taskMedia={taskMedia}
          />
        </div>
      )}
      
      {footer}
    </div>
  );
}
