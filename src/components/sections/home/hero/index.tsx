"use client";

import { cn } from "@/lib/utils";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import HeroContent from "./content";
import { Dock } from "./dock";
import { Background } from "./image-background";

interface DialogContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  dialogContent: ReactNode | null;
  setDialogContent: (content: ReactNode | null) => void;
  dialogTitle: string;
  setDialogTitle: (title: string) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<ReactNode | null>(null);
  const [dialogTitle, setDialogTitle] = useState("");

  return (
    <DialogContext.Provider
      value={{
        isOpen,
        setIsOpen,
        dialogContent,
        setDialogContent,
        dialogTitle,
        setDialogTitle,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}

function HeroContentWrapper() {
  const { isOpen } = useDialog();

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center transition-all duration-300",
        isOpen ? "pointer-events-none scale-95 opacity-0 blur-sm" : "blur-0 scale-100 opacity-100"
      )}
    >
      <HeroContent />
    </div>
  );
}

interface HeroProps {
  className?: string;
}

export default function Hero({ className }: HeroProps) {
  return (
    <DialogProvider>
      <section className={cn("relative h-screen min-h-[960px]", className)}>
        <Background />
        <HeroContentWrapper />
        <div className="absolute bottom-20 left-1/2 z-30 -translate-x-1/2">
          <Dock />
        </div>
        <DialogContainer />
      </section>
    </DialogProvider>
  );
}

function DialogContainer() {
  const { isOpen, setIsOpen, dialogContent, dialogTitle } = useDialog();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="bg-background/80 absolute inset-0 z-20 flex items-center justify-center px-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        className="bg-card text-card-foreground container w-full rounded-lg border p-6 shadow-lg"
        style={{ overflow: "auto" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-primary text-lg leading-none font-semibold tracking-tight">
            {dialogTitle}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="ring-offset-background focus:ring-ring text-muted-foreground hover:text-accent-foreground hover:bg-accent rounded-md p-1 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="mt-4">{dialogContent}</div>
      </div>
    </div>
  );
}
