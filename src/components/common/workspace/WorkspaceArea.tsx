"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React from "react";

interface WorkspaceAreaProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  useContainer?: boolean;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

export const WorkspaceArea: React.FC<WorkspaceAreaProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBack,
  actions,
  useContainer = false,
  contentClassName = "",
  noPadding = false,
  className,
}) => {
  const router = useRouter();
  const t = useTranslations("workspace");

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className={cn("h-full w-full", className)}>
      {/* Header */}
      {(title || actions) && (
        <header className="bg-background sticky top-0 z-10 flex h-16 items-center justify-between border-b px-3 sm:px-6">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="rounded-lg"
                aria-label={t("area.goBack")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}

            <div>
              {title && <h1 className="text-foreground text-lg font-semibold">{title}</h1>}
              {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-4">{actions}</div>
        </header>
      )}

      {useContainer ? (
        <div className="container mx-auto px-0 sm:px-4">
          <div
            className={cn(
              "bg-background mx-auto max-w-7xl",
              !noPadding && "py-3 sm:py-6",
              contentClassName
            )}
          >
            {children}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "bg-background h-full w-full flex-1",
            !noPadding && "p-3 sm:p-6",
            contentClassName
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// Pre-configured workspace layouts
export const ContainerWorkspace: React.FC<Omit<WorkspaceAreaProps, "useContainer">> = (props) => (
  <WorkspaceArea {...props} useContainer={true} />
);

export const FullWidthWorkspace: React.FC<Omit<WorkspaceAreaProps, "useContainer">> = (props) => (
  <WorkspaceArea {...props} useContainer={false} />
);
