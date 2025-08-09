import React from "react";

interface AudioControlsProps {
  audioUrl: string;
  mediaLoaded: boolean;
  onLoad: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({ audioUrl, mediaLoaded, onLoad }) => {
  // Don't render if audioUrl is empty or invalid
  if (!audioUrl || audioUrl.trim() === "") {
    return (
      <div className="w-full max-w-sm">
        <div className="border-destructive/20 bg-destructive/10 text-destructive flex h-12 w-full items-center justify-center rounded-md border text-sm"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <audio
        src={audioUrl}
        controls
        className={`w-full ${!mediaLoaded ? "invisible" : ""} focus-visible:ring-0 focus-visible:outline-none`}
        onLoadedData={onLoad}
        tabIndex={-1}
        preload="metadata"
      />
    </div>
  );
};
