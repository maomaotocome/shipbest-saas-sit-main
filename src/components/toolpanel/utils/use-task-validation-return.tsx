"use client";

import { AuthDialog } from "@/components/common/auth/dialog";
import { PricingDialog } from "@/components/common/pricing/dialog";
import { useUserCredits } from "@/hooks/use-user-credits";
import { TaskType } from "@/lib/constants";
import { calculateTaskCredits } from "@/services/tasks/credit";
import type { JsonObject } from "@/types/json";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

export interface TaskValidationParams {
  taskType: TaskType;
  request: JsonObject;
  metadata: JsonObject;
  onSuccess: () => Promise<void>;
}

export interface UseTaskValidationReturn {
  validateAndExecute: (params: TaskValidationParams) => Promise<void>;
  isAuthDialogOpen: boolean;
  setIsAuthDialogOpen: (open: boolean) => void;
  isPricingDialogOpen: boolean;
  setIsPricingDialogOpen: (open: boolean) => void;
  AuthDialogComponent: React.ReactElement;
  PricingDialogComponent: React.ReactElement;
}

export function useTaskValidation(): UseTaskValidationReturn {
  const { data: session, status } = useSession();
  const { data: userCredits } = useUserCredits();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const t = useTranslations("ai.common.validation");

  const validateAndExecute = useCallback(
    async (params: TaskValidationParams) => {
      const { taskType, request, metadata, onSuccess } = params;

      if (status === "loading") {
        toast.error(t("loadingUserInfo"));
        return;
      }

      if (!session?.user) {
        toast.error(t("userNotLoggedIn"));
        setIsAuthDialogOpen(true);
        return;
      }

      let requiredCredits = 0;
      try {
        const creditResult = await calculateTaskCredits({
          taskType,
          request,
          metadata,
        });
        requiredCredits = creditResult.totalCredits;
      } catch (error) {
        console.error("Failed to calculate credits:", error);
        toast.error(t("creditCalculationFailed"));
        return;
      }

      if (!userCredits) {
        toast.error(t("cannotGetUserCredits"));
        return;
      }

      if (userCredits.totalCredits < requiredCredits) {
        toast.error(
          t("insufficientCredits", {
            requiredCredits,
            availableCredits: userCredits.totalCredits,
          })
        );
        setIsPricingDialogOpen(true);
        return;
      }

      try {
        await onSuccess();
      } catch (error) {
        console.error("Task execution failed:", error);
        toast.error(t("taskExecutionFailed"));
      }
    },
    [session, status, userCredits, t]
  );

  const AuthDialogComponent = (
    <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
  );

  const PricingDialogComponent = (
    <PricingDialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen} />
  );

  return {
    validateAndExecute,
    isAuthDialogOpen,
    setIsAuthDialogOpen,
    isPricingDialogOpen,
    setIsPricingDialogOpen,
    AuthDialogComponent,
    PricingDialogComponent,
  };
}
