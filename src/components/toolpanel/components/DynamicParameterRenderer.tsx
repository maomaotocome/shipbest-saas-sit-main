import { FileItemInfo } from "@/components/common/uploader/types";
import { stripFileItemInfoFields } from "@/components/toolpanel/utils/parameter-utils";
import {
  BaseModel,
  ModelParameterConfig,
  ParameterConfig,
  ParameterType,
} from "@/conifg/aigc/types";
import { JsonObject, JsonValue } from "@/types/json";
import { ChevronDown, ChevronUp } from "lucide-react";
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { AspectRatioSelector } from "./from-fields/AspectRatioSelector";
import { BooleanSelector } from "./from-fields/BooleanSelector";
import { ImageUploader, ImageUploaderRef } from "./from-fields/ImageUploader";
import { ModelsSelector } from "./from-fields/ModelSelector";
import { NumberSelector } from "./from-fields/NumberSelector";
import { SeedSelector } from "./from-fields/SeedSelector";
import { SelectSelector } from "./from-fields/SelectSelector";
import { TextInput } from "./from-fields/TextInput";

export interface DynamicParameterRendererRef {
  uploadAllImages: () => Promise<void>;
}

interface DynamicParameterRendererProps {
  parameterConfig: ModelParameterConfig;
  values: JsonObject;
  onChange: (key: string, value: JsonValue) => void;
  t: (key: string) => string;
  uploadMode?: "immediate" | "manual" | "submit";
  onAllImagesUploaded?: (uploadedFiles: { [key: string]: FileItemInfo[] }) => void;
  isPublic: boolean;
}

export const DynamicParameterRenderer = forwardRef<
  DynamicParameterRendererRef,
  DynamicParameterRendererProps
>(
  (
    {
      parameterConfig,
      values,
      onChange,
      t,
      uploadMode = "immediate",
      onAllImagesUploaded,
      isPublic,
    },
    ref
  ) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const imageUploaderRefs = useRef<Map<string, ImageUploaderRef>>(new Map());

    const basicParameters = parameterConfig.parameters.filter((param) => !param.is_additional);
    const advancedParameters = parameterConfig.parameters.filter((param) => param.is_additional);
    const hasAdvancedParameters = advancedParameters.length > 0;

    // check if all images are uploaded
    const checkAllImagesUploaded = useCallback(() => {
      if (uploadMode !== "submit" || !onAllImagesUploaded) return;

      const uploadedFiles: { [key: string]: FileItemInfo[] } = {};
      let allUploaded = true;

      // check all image parameters
      parameterConfig.parameters.forEach((param) => {
        if (param.type === ParameterType.IMAGES) {
          const uploaderRef = imageUploaderRefs.current.get(param.key);
          if (uploaderRef) {
            uploadedFiles[param.key] = stripFileItemInfoFields(uploaderRef.getFiles(), {
              source: "user_upload",
            });

            // check if there are files and all are uploaded successfully
            if (
              uploadedFiles[param.key].length === 0 ||
              uploadedFiles[param.key].some((file) => file.status !== "success")
            ) {
              allUploaded = false;
            }
          } else {
            allUploaded = false;
          }
        }
      });

      if (allUploaded) {
        onAllImagesUploaded(uploadedFiles);
      }
    }, [uploadMode, onAllImagesUploaded, parameterConfig]);

    useImperativeHandle(
      ref,
      () => ({
        uploadAllImages: async () => {
          const uploadPromises: Promise<void>[] = [];
          const parameterKeys: string[] = [];

          // upload all images
          imageUploaderRefs.current.forEach((uploaderRef, paramKey) => {
            if (uploaderRef) {
              uploadPromises.push(uploaderRef.upload());
              parameterKeys.push(paramKey);
            }
          });

          // wait for all uploads to complete
          await Promise.all(uploadPromises);
          /*
        // Longer delay to ensure state updates have propagated
        await new Promise((resolve) => setTimeout(resolve, 200));*/

          // after uploads are complete, get the latest file information and update the parameter values
          const uploadedFiles: { [key: string]: FileItemInfo[] } = {};

          // First collect all uploaded files with stronger retry mechanism
          for (const paramKey of parameterKeys) {
            const uploaderRef = imageUploaderRefs.current.get(paramKey);
            if (uploaderRef) {
              let retryCount = 0;
              const maxRetries = 15; // Increase retry count significantly
              let updatedFiles: FileItemInfo[] = [];

              // Retry getting files until all are in success state or max retries reached
              while (retryCount < maxRetries) {
                updatedFiles = uploaderRef.getFiles() as FileItemInfo[];

                // Check if all files are successfully uploaded
                const allUploaded = updatedFiles.every(
                  (file) => file.status === "success" && file.objectId
                );

                if (allUploaded || updatedFiles.length === 0) {
                  console.log(
                    `Parameter ${paramKey}: All files successfully uploaded after ${retryCount + 1} retries`
                  );
                  break;
                }

                retryCount++;
                if (retryCount < maxRetries) {
                  await new Promise((resolve) => setTimeout(resolve, 100)); // Increase delay
                }
              }

              if (retryCount >= maxRetries) {
                console.warn(
                  `Parameter ${paramKey}: Reached max retries, using current state:`,
                  updatedFiles.map((f) => ({
                    name: f.name,
                    status: f.status,
                    objectId: !!f.objectId,
                  }))
                );
              }

              uploadedFiles[paramKey] = updatedFiles;
            }
          }

          // Then update state synchronously to ensure immediate availability
          parameterKeys.forEach((paramKey) => {
            const updatedFiles = stripFileItemInfoFields(uploadedFiles[paramKey], {
              source: "user_upload",
            });
            if (updatedFiles) {
              onChange(paramKey, updatedFiles as unknown as JsonValue);
            }
          });

          // call callback function, pass all uploaded files information
          if (onAllImagesUploaded) {
            onAllImagesUploaded(uploadedFiles);
          }
        },
      }),
      [onChange, onAllImagesUploaded]
    );

    const renderImagesParameter = ({
      param,
      isPublic,
    }: {
      param: ParameterConfig;
      isPublic: boolean;
    }) => {
      const value = values[param.key];
      return (
        <ImageUploader
          key={param.key}
          ref={(ref) => {
            if (ref) {
              imageUploaderRefs.current.set(param.key, ref);
            } else {
              imageUploaderRefs.current.delete(param.key);
            }
          }}
          isPublic={isPublic}
          value={(value as unknown as FileItemInfo[]) || []}
          onChange={(files) => {
            const strippedFiles = stripFileItemInfoFields(files, { source: "user_upload" });
            onChange(param.key, strippedFiles as unknown as JsonValue);
          }}
          imageCount={param.image_count || 1}
          description={param.description}
          required={param.required}
          uploadMode={uploadMode}
          baseMetadata={{ source: "user_upload" }}
          onUploadComplete={() => {
            if (uploadMode === "submit") {
              // Use setTimeout to avoid state updates during render
              setTimeout(() => {
                checkAllImagesUploaded();
              }, 0);
            }
          }}
        />
      );
    };

    const renderTextParameter = ({
      param,
      userInput,
      parameterConfig,
    }: {
      param: ParameterConfig;
      userInput: JsonObject;
      parameterConfig: ModelParameterConfig;
    }) => {
      const value = values[param.key];

      return (
        <TextInput
          key={param.key}
          title={param.label}
          placeholder={param.description || param.label}
          value={(value as string) || ""}
          onChange={(newValue) => onChange(param.key, newValue)}
          description={param.description}
          required={param.required}
          collapsible={param.collapsible}
          defaultCollapsed={param.defaultCollapsed}
          text_max_length={((): number | undefined => {
            if (typeof param.text_max_length === "number") {
              return param.text_max_length;
            }

            if (typeof param.text_max_length === "function") {
              try {
                return param.text_max_length({
                  parameterConfig,
                  userInput,
                });
              } catch (err) {
                console.warn(`Failed to evaluate text_max_length for ${param.key}:`, err);
                return undefined;
              }
            }

            return undefined;
          })()}
        />
      );
    };

    const renderNumberParameter = (param: ParameterConfig) => {
      const value = values[param.key];

      if (param.values && param.values.length > 0) {
        return (
          <NumberSelector
            key={param.key}
            value={(value as number) || (param.defaultValue as number)}
            onChange={(newValue: number) => onChange(param.key, newValue)}
            label={param.label}
            description={param.description}
            values={param.values}
            unit={param.number_unit}
            required={param.required}
            collapsible={param.collapsible}
            defaultCollapsed={param.defaultCollapsed}
          />
        );
      }

      const min = param.min || 0;
      const max = param.max || 100;
      const step = param.step || 1;

      const isDiscrete = step === 1 && max - min <= 10;

      if (isDiscrete) {
        const values: number[] = [];
        for (let i = min; i <= max; i += step) {
          values.push(i);
        }

        return (
          <NumberSelector
            key={param.key}
            value={(value as number) || (param.defaultValue as number)}
            onChange={(newValue: number) => onChange(param.key, newValue)}
            label={param.label}
            description={param.description}
            values={values}
            unit={param.number_unit}
            required={param.required}
            collapsible={param.collapsible}
            defaultCollapsed={param.defaultCollapsed}
          />
        );
      } else {
        return (
          <NumberSelector
            key={param.key}
            value={(value as number) || (param.defaultValue as number)}
            onChange={(newValue: number) => onChange(param.key, newValue)}
            label={param.label}
            description={param.description}
            range={{ min, max, step }}
            unit={param.number_unit}
            required={param.required}
            collapsible={param.collapsible}
            defaultCollapsed={param.defaultCollapsed}
          />
        );
      }
    };

    const renderAspectRatioParameter = (param: ParameterConfig) => {
      const value = values[param.key];
      return (
        <AspectRatioSelector
          key={param.key}
          aspectRatios={param.aspectRatios || []}
          defaultValue={value || param.defaultValue}
          onAspectRatioChange={(newValue) => {
            if (!newValue) return;

            // If newValue is already converted (not an AspectRatio object), use it directly
            if (
              typeof newValue === "string" ||
              (typeof newValue === "object" && newValue && !("ratio" in newValue))
            ) {
              onChange(param.key, newValue);
            } else {
              // For AspectRatio objects, use the value property
              const aspectRatio = newValue as { value: JsonValue };
              onChange(param.key, aspectRatio.value);
            }
          }}
          label={param.label}
          description={param.description}
          required={param.required}
          collapsible={param.collapsible}
          defaultCollapsed={param.defaultCollapsed}
          allowCustom={param.allowCustomRatio}
          customRange={param.customRange}
          customRatioConvert={param.customRatioConvert}
        />
      );
    };

    const renderSelectParameter = (param: ParameterConfig) => {
      const value = values[param.key];
      return (
        <SelectSelector
          key={param.key}
          value={(value as string) || (param.defaultValue as string)}
          onChange={(newValue) => onChange(param.key, newValue)}
          label={param.label}
          options={
            param.options?.map((option) => ({
              value: option.value as string,
              label: option.label,
              cover: option.cover, // Support cover images
            })) || []
          }
          description={param.description}
          required={param.required}
          collapsible={param.collapsible}
          defaultCollapsed={param.defaultCollapsed}
          has_cover={param.has_cover} // Pass has_cover property
        />
      );
    };

    const renderModelParameter = (param: ParameterConfig) => {
      const value = values[param.key];
      const models = param.models || [];

      // Find the currently selected model based on the value
      const selectedModels: BaseModel[] = [];
      if (value) {
        const selectedModel = models.find((model) => model.code === value);
        if (selectedModel) {
          selectedModels.push(selectedModel);
        }
      }

      return (
        <ModelsSelector
          key={param.key}
          models={models}
          selectedModels={selectedModels}
          setSelectedModels={(selectedModels) => {
            // For single selection, use the first selected model's code
            const modelCode = selectedModels.length > 0 ? selectedModels[0].code : "";
            onChange(param.key, modelCode);
          }}
          required={param.required}
          collapsible={param.collapsible}
          defaultCollapsed={param.defaultCollapsed}
        />
      );
    };

    const renderSeedParameter = (param: ParameterConfig) => {
      const value = values[param.key];
      return (
        <SeedSelector
          key={param.key}
          seed={(value as number) || (param.defaultValue as number) || 0}
          onSeedChange={(newValue) => onChange(param.key, newValue)}
          label={param.label}
          description={param.description}
          required={param.required}
        />
      );
    };

    const renderBooleanParameter = (param: ParameterConfig) => {
      const value = values[param.key];
      const booleanValue = (value as boolean) ?? (param.defaultValue as boolean) ?? false;

      return (
        <BooleanSelector
          key={param.key}
          value={booleanValue}
          onChange={(newValue) => {
            onChange(param.key, newValue);
          }}
          label={param.label}
          description={param.description}
          required={param.required}
        />
      );
    };

    const renderParameter = (
      param: ParameterConfig,
      userInput: JsonObject,
      parameterConfig: ModelParameterConfig,
      isPublic: boolean
    ) => {
      // Check showWhen condition
      if (param.showWhen) {
        const shouldShow = Object.entries(param.showWhen).every(
          ([key, expectedValue]) => values[key] === expectedValue
        );
        if (!shouldShow) return null;
      }

      switch (param.type) {
        case ParameterType.IMAGES:
          return renderImagesParameter({ param, isPublic });
        case ParameterType.TEXT:
          return renderTextParameter({ param, userInput, parameterConfig });
        case ParameterType.NUMBER:
          return renderNumberParameter(param);
        case ParameterType.ASPECT_RATIO:
          return renderAspectRatioParameter(param);
        case ParameterType.SELECT:
          return renderSelectParameter(param);
        case ParameterType.MODEL:
          return renderModelParameter(param);
        case ParameterType.SEED:
          return renderSeedParameter(param);
        case ParameterType.BOOLEAN:
          return renderBooleanParameter(param);
        default:
          return null;
      }
    };

    return (
      <div className="space-y-4">
        {basicParameters.map((param) => renderParameter(param, values, parameterConfig, isPublic))}

        {/* Advanced parameters toggle button */}
        {hasAdvancedParameters && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
            >
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {showAdvanced ? t("hideAdvancedParameters") : t("showAdvancedParameters")}
            </button>
          </div>
        )}

        {/* Advanced parameters */}
        {hasAdvancedParameters && showAdvanced && (
          <div className="space-y-4">
            {advancedParameters.map((param) =>
              renderParameter(param, values, parameterConfig, isPublic)
            )}
          </div>
        )}
      </div>
    );
  }
);

DynamicParameterRenderer.displayName = "DynamicParameterRenderer";
