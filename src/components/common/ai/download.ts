import { getObjectUrl } from "@/lib/utils";

// The browser "download" attribute on <a> only guarantees a download
// when the resource is from the same-origin. For cross-origin resources –
// which is common for our object storage/CDN URLs – the browser will
// simply navigate to the url (especially for videos such as mp4). In those
// cases we fall back to fetching the binary ourselves and then creating a
// temporary ObjectURL to enforce a download.

// NOTE: Only a lightweight heuristic is used here (file extension &
// cross-origin check). If the heuristic fails we still fall back to the
// original behaviour so nothing breaks.

export async function downloadMedia({
  originalObjectId,
  compressedObjectId,
  sourceUrl,
  fileName,
}: {
  originalObjectId?: string;
  compressedObjectId?: string;
  sourceUrl?: string;
  fileName: string;
}) {
  // Resolve URL with priority: original > sourceUrl > compressed (lowest)
  const url =
    (originalObjectId && getObjectUrl(originalObjectId)) ||
    sourceUrl ||
    (compressedObjectId && getObjectUrl(compressedObjectId));

  if (!url) return;

  // Simple helper to decide whether we should fetch the resource first.
  const shouldForceBlobDownload = (() => {
    const lower = fileName.toLowerCase();
    const isVideo = lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov");

    if (!isVideo) return false;

    try {
      const parsedUrl = new URL(url, window.location.href);
      // If origin differs, browsers will likely ignore the download attribute.
      return parsedUrl.origin !== window.location.origin;
    } catch {
      // If we fail to parse, play safe and try blob download.
      return true;
    }
  })();

  if (shouldForceBlobDownload) {
    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL after download is triggered.
      URL.revokeObjectURL(objectUrl);
      return;
    } catch (err) {
      console.error("blob download failed, falling back to direct link", err);
      // If blob download fails, fall through to default behaviour.
    }
  }

  // Default: rely on the browser's native download handling.
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
