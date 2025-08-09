"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { MediaItem, MediaPreviewDialog } from "./MediaPreviewDialog";

interface MediaPreviewContextType {
  openPreview: (items: MediaItem[], initialIndex: number, sidebar: ReactNode | ReactNode[]) => void;
  closePreview: () => void;
}

const MediaPreviewContext = createContext<MediaPreviewContextType | undefined>(undefined);

interface MediaPreviewProviderProps {
  children: ReactNode;
}

export function MediaPreviewProvider({ children }: MediaPreviewProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [sidebar, setSidebar] = useState<ReactNode | ReactNode[]>(null);

  const openPreview = (
    previewItems: MediaItem[],
    previewInitialIndex: number,
    previewSidebar: ReactNode | ReactNode[]
  ) => {
    setItems(previewItems);
    setInitialIndex(previewInitialIndex);
    setSidebar(previewSidebar);
    setIsOpen(true);
  };

  const closePreview = () => {
    setIsOpen(false);
    // Clear data after animation completes
    setTimeout(() => {
      setItems([]);
      setInitialIndex(0);
      setSidebar(null);
    }, 200);
  };

  return (
    <MediaPreviewContext.Provider value={{ openPreview, closePreview }}>
      {children}
      <MediaPreviewDialog
        isOpen={isOpen}
        onClose={closePreview}
        items={items}
        initialIndex={initialIndex}
        sidebar={sidebar}
      />
    </MediaPreviewContext.Provider>
  );
}

export function useMediaPreview() {
  const context = useContext(MediaPreviewContext);
  if (context === undefined) {
    throw new Error("useMediaPreview must be used within a MediaPreviewProvider");
  }
  return context;
}
