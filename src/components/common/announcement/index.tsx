"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface AnnouncementProps {
  message: string;
  onClose?: () => void;
}

export default function Announcement({ message, onClose }: AnnouncementProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex h-10 items-center justify-between">
          <div className="flex-1" />
          <p className="text-sm font-medium">{message}</p>
          <div className="flex flex-1 justify-end">
            <button
              onClick={handleClose}
              className="hover:bg-primary-foreground/10 rounded-full p-1"
              aria-label="Close announcement"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
