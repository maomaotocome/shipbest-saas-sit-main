import React from "react";

interface AudioMetadataProps {
  fileName?: string;
}

export const AudioMetadata: React.FC<AudioMetadataProps> = ({ fileName }) => {
  if (!fileName) return null;

  return (
    <div className="mt-6 text-center">
      <p className="text-foreground text-lg font-medium">{fileName}</p>
      <p className="text-muted-foreground mt-1 text-sm">Audio File</p>
    </div>
  );
};