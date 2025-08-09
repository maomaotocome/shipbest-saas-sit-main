import { cn } from "@/lib/utils";
import React from "react";

interface LoadingAnimateProps {
  className?: string;
}

const LoadingAnimate: React.FC<LoadingAnimateProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 300 300"
      style={{ isolation: "isolate" }}
      className={cn(className)}
    >
      <defs>
        <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--loader-gradient-start) !important">
            <animate
              attributeName="stop-color"
              values="var(--loader-gradient-start) !important;var(--loader-gradient-middle) !important;var(--loader-gradient-end) !important;var(--loader-gradient-start) !important"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="var(--loader-gradient-end) !important">
            <animate
              attributeName="stop-color"
              values="var(--loader-gradient-end) !important;var(--loader-gradient-start) !important;var(--loader-gradient-middle) !important;var(--loader-gradient-end) !important"
              dur="2s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
      </defs>

      <style>
        {`
          @keyframes grow-shrink-rotate {
            0% {
              stroke-dasharray: 0 817;
              stroke-dashoffset: 0;
              transform: rotate(0deg);
            }
            40% {
              stroke-dasharray: 817 0;
              stroke-dashoffset: 0;
              transform: rotate(360deg);
            }
            60% {
              stroke-dasharray: 817 0;
              stroke-dashoffset: 0;
              transform: rotate(540deg);
            }
            100% {
              stroke-dasharray: 0 817;
              stroke-dashoffset: 817;
              transform: rotate(720deg);
            }
          }

          @keyframes dash-offset {
            0% {
              stroke-dashoffset: 0;
            }
            100% {
              stroke-dashoffset: 817;
            }
          }

          .arc {
            fill: none !important;
            stroke: url(#loaderGradient) !important;
            stroke-width: 40 !important;
            stroke-linecap: round !important;
            transform-origin: 150px 150px;
            animation: grow-shrink-rotate 3s ease-in-out infinite, dash-offset 3s linear infinite;
          }
        `}
      </style>

      <circle className="arc" cx="150" cy="150" r="130" />
    </svg>
  );
};

export default LoadingAnimate;
