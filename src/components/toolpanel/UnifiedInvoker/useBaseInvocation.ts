import { FileItemInfo } from "@/components/common/uploader";
import { ParameterType } from "@/conifg/aigc/types";
import { TaskType } from "@/lib/constants";
import { JsonObject, JsonValue } from "@/types/json";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { DynamicParameterRendererRef } from "../components/DynamicParameterRenderer";
import { stripFileItemInfoFields } from "../utils/parameter-utils";

interface BaseInvocationParams {
  task_type: TaskType;
  is_public?: boolean;
  request: JsonObject;
  metadata: JsonObject;
}

interface BaseInvocationConfig {
  parameters: Array<{
    key: string;
    type: ParameterType;
    required?: boolean;
    label?: string;
  }>;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function useBaseInvocation<T extends BaseInvocationParams>(
  initialData: () => T,
  dependencies: unknown[] = [],
  getDefaultIsPublic?: () => boolean
) {
  const [invocationData, setInvocationData] = useState<T>(initialData);
  const invocationDataRef = useRef(invocationData);
  const dynamicParameterRendererRef = useRef<DynamicParameterRendererRef | null>(null);

  // Update ref whenever state changes
  useEffect(() => {
    invocationDataRef.current = invocationData;
  }, [invocationData]);

  // Reset data when dependencies change
  useEffect(() => {
    const newData = initialData();
    // Apply user's default isPublic setting if provided
    if (getDefaultIsPublic && newData.is_public === undefined) {
      newData.is_public = getDefaultIsPublic();
    }
    setInvocationData(newData);
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRequestChange = useCallback((key: string, value: JsonValue) => {
    if (value !== undefined && value !== null) {
      setInvocationData((prev) => ({
        ...prev,
        request: {
          ...prev.request,
          [key]: value,
        },
      }));
    } else {
      // If value is undefined, delete the key from the request
      setInvocationData((prev) => {
        const newRequest = { ...prev.request };
        delete newRequest[key];
        return {
          ...prev,
          request: newRequest,
        };
      });
    }
  }, []);

  const handleMetadataChange = useCallback((key: string, value: JsonValue) => {
    if (value !== undefined && value !== null) {
      setInvocationData((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [key]: value,
        },
      }));
    } else {
      // If value is undefined, delete the key from metadata
      setInvocationData((prev) => {
        const newMetadata = { ...prev.metadata };
        delete newMetadata[key];
        return {
          ...prev,
          metadata: newMetadata,
        };
      });
    }
  }, []);

  const handlePrivacyChange = useCallback((isPublic: boolean) => {
    setInvocationData((prev) => ({
      ...prev,
      is_public: isPublic,
    }));
  }, []);

  const handleAllImagesUploaded = useCallback(
    (
      uploadedFiles: { [key: string]: FileItemInfo[] },
      onUpdate?: (key: string, value: JsonValue) => void
    ) => {
      console.log("All images uploaded:", uploadedFiles);

      // Debug: Log detailed file status information
      Object.entries(uploadedFiles).forEach(([key, files]) => {
        console.log(
          `Parameter ${key}:`,
          files.map((f) => ({
            name: f.name,
            status: f.status,
            objectId: f.objectId,
            hasObjectId: !!f.objectId,
          }))
        );
      });

      // Count uploaded files
      const totalUploadedCount = Object.values(uploadedFiles).reduce(
        (sum, files) => sum + files.length,
        0
      );
      const successfulUploads = Object.values(uploadedFiles).reduce(
        (sum, files) => sum + files.filter((file) => file.status === "success").length,
        0
      );

      if (totalUploadedCount > 0) {
        if (successfulUploads === totalUploadedCount) {
          toast.success(`All images uploaded successfully! Total: ${totalUploadedCount} files`);
        } else {
          toast.error(
            `Some images failed to upload, Success: ${successfulUploads}/${totalUploadedCount}`
          );
        }
      }

      // If update callback is provided, update parameter state
      if (onUpdate) {
        Object.entries(uploadedFiles).forEach(([key, files]) => {
          onUpdate(
            key,
            stripFileItemInfoFields(files, { source: "user_upload" }) as unknown as JsonValue
          );
        });
      }
    },
    []
  );

  // Wrap handleAllImagesUploaded to automatically update parameter state
  const handleAllImagesUploadedWithUpdate = useCallback(
    (uploadedFiles: { [key: string]: FileItemInfo[] }) => {
      handleAllImagesUploaded(uploadedFiles, handleRequestChange);
    },
    [handleAllImagesUploaded, handleRequestChange]
  );

  // Simplified image upload check and upload function
  const checkAndUploadImages = useCallback(
    async (
      config: BaseInvocationConfig,
      t: (key: string, params?: Record<string, unknown>) => string
    ): Promise<{
      success: boolean;
      error?: string;
      uploadedFiles?: { [key: string]: FileItemInfo[] };
    }> => {
      console.log("Checking for images that need upload...");

      if (!dynamicParameterRendererRef.current) {
        console.log("No dynamicParameterRendererRef available");
        return { success: true };
      }

      // Check if there are image parameters that need to be uploaded
      const imageParameters = config.parameters.filter(
        (param) => param.type === ParameterType.IMAGES
      );

      if (imageParameters.length === 0) {
        console.log("No image parameters found");
        return { success: true };
      }

      let hasUnuploadedImages = false;

      // Check current state for unuploaded images
      for (const param of imageParameters) {
        const value = invocationDataRef.current.request[param.key];
        if (value && Array.isArray(value) && value.length > 0) {
          const hasUnuploaded = value.some(
            (file: unknown) =>
              file &&
              typeof file === "object" &&
              file !== null &&
              "status" in file &&
              (file as { status: string }).status !== "success"
          );
          if (hasUnuploaded) {
            hasUnuploadedImages = true;
            break;
          }
        }
      }

      if (!hasUnuploadedImages) {
        console.log("All images are already uploaded");
        return { success: true };
      }

      // Upload images
      console.log("Found unuploaded images, starting upload...");
      try {
        await dynamicParameterRendererRef.current.uploadAllImages();

        console.log("Image upload completed successfully");
        return { success: true };
      } catch (error) {
        console.error("Image upload failed:", error);
        const errorMessage = t("imageUploadFailed");
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // Simplified validation function
  const validateRequest = useCallback(
    (
      config: BaseInvocationConfig,
      t: (key: string, params?: Record<string, unknown>) => string
    ): ValidationResult => {
      console.log("Validating request...");

      const requiredFields = config.parameters.filter((param) => param.required === true);
      const errors: string[] = [];

      for (const field of requiredFields) {
        const value = invocationDataRef.current.request[field.key];

        if (field.type === ParameterType.IMAGES) {
          // For image fields, check if there are uploaded files with objectId
          const hasValidImages =
            value &&
            Array.isArray(value) &&
            value.length > 0 &&
            value.some(
              (file: unknown) =>
                file &&
                typeof file === "object" &&
                file !== null &&
                "objectId" in file &&
                "status" in file &&
                (file as { objectId: string; status: string }).objectId &&
                (file as { objectId: string; status: string }).status === "success"
            );

          if (!hasValidImages) {
            const errorMessage = t("pleaseUploadImageFirst");
            toast.error(errorMessage);
            errors.push("Image upload required");
          }
        } else {
          // For other fields, check if empty
          if (
            value === undefined ||
            value === null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0)
          ) {
            const fieldName = field.label || field.key;
            const errorMessage = t("pleaseCompleteRequiredField", { fieldName });
            toast.error(errorMessage);
            errors.push(`Field ${field.key} is required`);
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    []
  );

  const setDynamicParameterRendererRef = useCallback((ref: DynamicParameterRendererRef | null) => {
    dynamicParameterRendererRef.current = ref;
  }, []);

  const createValidateAndPrepareRequest = useCallback(
    (config: BaseInvocationConfig) => {
      return async (t: (key: string, params?: Record<string, unknown>) => string) => {
        console.log("Starting request validation and preparation...");

        // Step 1: Check and upload images if needed
        const uploadResult = await checkAndUploadImages(config, t);
        if (!uploadResult.success) {
          return {
            isValid: false,
            errors: [uploadResult.error || "Image upload failed"],
          } as const;
        }
        console.log("invocationDataRef.current.request", invocationDataRef.current.request);
        // Step 2: Validate all required fields using the most up-to-date data
        const validation = validateRequest(config, t);
        if (!validation.isValid) {
          return {
            isValid: false,
            errors: validation.errors,
          } as const;
        }

        // Step 3: Prepare clean request data
        const cleanRequest = Object.fromEntries(
          Object.entries(invocationDataRef.current.request).filter(
            ([, value]) => value !== undefined
          )
        );
        console.log(cleanRequest);
        return {
          isValid: true,
          taskType: invocationDataRef.current.task_type,
          request: cleanRequest,
          metadata: invocationDataRef.current.metadata,
        } as const;
      };
    },
    [checkAndUploadImages, validateRequest]
  );

  return {
    invocationData,
    invocationDataRef,
    handleRequestChange,
    handleMetadataChange,
    handlePrivacyChange,
    handleAllImagesUploaded: handleAllImagesUploadedWithUpdate,
    setDynamicParameterRendererRef,
    createValidateAndPrepareRequest,
  };
}
