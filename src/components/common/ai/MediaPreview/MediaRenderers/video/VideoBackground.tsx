import React from "react";

interface VideoBackgroundProps {
  children: React.ReactNode;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({ children }) => {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 opacity-60 rounded-tl-lg md:rounded-tr-none md:rounded-br-none md:rounded-bl-none rounded-tr-lg md:rounded-tl-lg" />
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm rounded-tl-lg md:rounded-tr-none md:rounded-br-none md:rounded-bl-none rounded-tr-lg md:rounded-tl-lg" />
      {children}
    </div>
  );
};