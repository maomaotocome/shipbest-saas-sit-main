import { useTranslations } from "next-intl";

interface MediaFileInfoProps {
  width?: number;
  height?: number;
  fileSize?: number;
}

export function MediaFileInfo({ width, height, fileSize }: MediaFileInfoProps) {
  const tFileInfo = useTranslations("ai.common.fileInfo");

  return (
    <div className="space-y-2 text-sm">
      {width && height ? (
        <div className="flex justify-between">
          <span className="text-muted-foreground">{tFileInfo("dimensions")}:</span>
          <span className="font-mono">
            {width}×{height}
          </span>
        </div>
      ) : null}
      {fileSize ? (
        <div className="flex justify-between">
          <span className="text-muted-foreground">{tFileInfo("fileSize")}:</span>
          <span className="font-mono">
            {Math.round((fileSize / 1024 / 1024) * 100) / 100}MB ({fileSize} bytes)
          </span>
        </div>
      ) : null}
    </div>
  );
}

interface MediaFileInfoInlineProps {
  width?: number;
  height?: number;
  fileSize?: number;
}

export function MediaFileInfoInline({ width, height, fileSize }: MediaFileInfoInlineProps) {
  const tFileInfo = useTranslations("ai.common.fileInfo");

  return (
    <>
      {width && height ? (
        <div>
          <b>{tFileInfo("dimensions")}:</b> {width}×{height}
        </div>
      ) : null}
      {fileSize ? (
        <div>
          <b>{tFileInfo("fileSize")}:</b>{" "}
          {Math.round((fileSize / 1024 / 1024) * 100) / 100}MB ({fileSize} bytes)
        </div>
      ) : null}
    </>
  );
}