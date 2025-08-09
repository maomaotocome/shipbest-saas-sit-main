"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  FileIcon,
  FileTextIcon,
  ImageIcon,
  RadioIcon,
  Search,
  VideoIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";
import { FileItemInfo } from "./types";

interface StorageFile {
  id: string;
  filename: string;
  path: string;
  size: number;
  type: string;
  extension?: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
}

interface FileLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (files: FileItemInfo[]) => void;
  multiple?: boolean;
  maxCount?: number;
  accept?: string;
}

interface FileTypeConfig {
  icon: React.ReactNode;
  label: string;
  mimePattern: RegExp;
}

const FileLibraryModal: React.FC<FileLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  maxCount = 1,
  accept,
}) => {
  const t = useTranslations("uploader");
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [, setLoading] = useState(false);

  const FILE_TYPES = useMemo<Record<string, FileTypeConfig>>(
    () => ({
      image: {
        icon: <ImageIcon className="h-4 w-4" />,
        label: t("fileLibrary.tabs.image") || "Images",
        mimePattern: /^image\//,
      },
      video: {
        icon: <VideoIcon className="h-4 w-4" />,
        label: t("fileLibrary.tabs.video") || "Videos",
        mimePattern: /^video\//,
      },
      audio: {
        icon: <RadioIcon className="h-4 w-4" />,
        label: t("fileLibrary.tabs.audio") || "Audio",
        mimePattern: /^audio\//,
      },
      document: {
        icon: <FileTextIcon className="h-4 w-4" />,
        label: t("fileLibrary.tabs.document") || "Documents",
        mimePattern: /^application\/(pdf|msword|vnd\.openxmlformats|vnd\.ms-excel)/,
      },
      other: {
        icon: <FileIcon className="h-4 w-4" />,
        label: t("fileLibrary.tabs.other") || "Others",
        mimePattern: /.*/,
      },
    }),
    [t]
  );

  // Filter allowed file types based on accept attribute
  const allowedMimeTypes = useMemo(() => {
    if (!accept) return null;
    return accept.split(",").map((type) => {
      // Convert formats like .jpg to MIME type patterns
      return type.replace(".", "").replace("jpg", "jpeg").toLowerCase();
    });
  }, [accept]);

  // Get file list
  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        // TODO: Actual API call
        const response = await fetch("/api/storage/files");
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error(error as string);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen]);

  // File categorization and search filtering
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      // Search term filtering
      const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase());

      // Type tag filtering
      const matchesTab =
        currentTab === "all" || FILE_TYPES[currentTab]?.mimePattern.test(file.type);

      // MIME type filtering
      const matchesMime =
        !allowedMimeTypes || allowedMimeTypes.some((mime) => file.type.includes(mime));

      return matchesSearch && matchesTab && matchesMime;
    });
  }, [files, searchTerm, currentTab, allowedMimeTypes, FILE_TYPES]);

  // Handle file selection
  const handleFileSelect = (file: StorageFile) => {
    if (!multiple) {
      setSelectedFiles(new Set([file.id]));
      return;
    }

    const newSelection = new Set(selectedFiles);
    if (newSelection.has(file.id)) {
      newSelection.delete(file.id);
    } else if (newSelection.size < maxCount) {
      newSelection.add(file.id);
    }
    setSelectedFiles(newSelection);
  };

  // Handle confirm selection
  const handleConfirm = () => {
    const selectedItems: FileItemInfo[] = files
      .filter((file) => selectedFiles.has(file.id))
      .map((file) => ({
        id: file.id,
        name: file.filename,
        size: file.size,
        type: file.type,
        url: file.path,
        status: "success",
      }));

    onSelect(selectedItems);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex h-[600px] flex-col sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t("fileLibrary.title")}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center space-x-2 px-4">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("fileLibrary.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1">
          <TabsList className="px-4">
            <TabsTrigger value="all">{t("fileLibrary.tabs.all")}</TabsTrigger>
            {Object.entries(FILE_TYPES).map(([key, { label }]) => (
              <TabsTrigger key={key} value={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 px-4 py-2">
            <div className="grid grid-cols-4 gap-4">
              {filteredFiles.map((file) => {
                const isSelected = selectedFiles.has(file.id);
                const fileType =
                  Object.entries(FILE_TYPES).find(([, config]) =>
                    config.mimePattern.test(file.type)
                  )?.[0] || "other";

                return (
                  <div
                    key={file.id}
                    className={`group relative cursor-pointer rounded-lg border-2 p-4 transition-all ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                    onClick={() => handleFileSelect(file)}
                  >
                    <div className="flex flex-col items-center">
                      {FILE_TYPES[fileType].icon}
                      <span className="mt-2 line-clamp-2 text-center text-sm">{file.filename}</span>
                      <span className="text-xs text-gray-500">
                        {t("fileLibrary.fileSize").replace(
                          "{{size}}",
                          (file.size / 1024).toFixed(1)
                        )}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-blue-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="px-4 py-2">
          <div className="flex w-full items-center justify-between">
            <span className="text-sm text-gray-500">
              {t("fileLibrary.selectedCount", {
                count: selectedFiles.size,
              })}
            </span>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                {t("fileLibrary.cancel")}
              </Button>
              <Button onClick={handleConfirm}>{t("fileLibrary.confirm")}</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileLibraryModal;
