"use client";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Maximize, Minimize } from "lucide-react";
import { useState } from "react";

interface StudioPageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function StudioPageLayout({ title, description, children }: StudioPageLayoutProps) {
  const [isWide, setIsWide] = useState(true);
  const isMobile = useIsMobile();
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center border-b p-4 sm:p-6">
        <div
          className={cn(
            // On mobile, always take full width and keep space-between layout to avoid horizontal overflow
            isMobile
              ? "w-full justify-between"
              : isWide
                ? "w-full justify-center"
                : "container mx-auto justify-between",
            "relative flex items-center"
          )}
        >
          <div className={cn(!isMobile && isWide && "text-center")}>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          {!isMobile && (
            <div className={cn("flex items-center gap-2", isWide && "absolute right-0")}>
              <Button variant="ghost" size="icon" onClick={() => setIsWide((v) => !v)}>
                {isWide ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                <span className="sr-only">{isWide ? "Exit full screen" : "Enter full screen"}</span>
              </Button>
            </div>
          )}
        </div>
      </header>
      <main
        className={cn(
          // Use full width on mobile to prevent horizontal scroll
          isMobile ? "w-full" : isWide ? "md:w-full" : "container mx-auto",
          isMobile ? "" : "min-h-0",
          "flex-1 p-2 md:p-6"
        )}
      >
        {children}
      </main>
    </div>
  );
}
