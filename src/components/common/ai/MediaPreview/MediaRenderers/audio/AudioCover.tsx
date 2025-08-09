import { getObjectUrl } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface AudioCoverProps {
  imageUrl?: string;
  compressedImageObjectId?: string;
  originalImageObjectId?: string;
  fileName?: string;
}

export const AudioCover: React.FC<AudioCoverProps> = ({
  imageUrl,
  compressedImageObjectId,
  originalImageObjectId,
}) => {
  const coverImageUrl = getObjectUrl(compressedImageObjectId || originalImageObjectId) || imageUrl;

  return (
    <Image
      src={coverImageUrl || "/images/aigc/filetypes/audio.svg"}
      alt="Audio file"
      width={256}
      height={256}
      unoptimized
      className="mb-8 h-32 w-32 rounded-full text-white"
    />
  );
};
