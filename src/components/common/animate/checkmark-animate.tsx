import React from "react";

const CheckmarkAnimate: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 300 300"
      style={{ isolation: "isolate" }}
    >
      <defs>
        <linearGradient id="checkmarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
          @keyframes circle-animation {
            0% {
              stroke-dasharray: 0 1194;
            }
            100% {
              stroke-dasharray: 1194 0;
            }
          }

          @keyframes tick-animation {
            0% {
              stroke-dasharray: 0 400;
              opacity: 0;
            }
            1% {
              opacity: 1;
            }
            100% {
              stroke-dasharray: 400 0;
              opacity: 1;
            }
          }

          .circle {
            fill: none;
            stroke: url(#checkmarkGradient);
            stroke-width: 40;
            stroke-linecap: round;
            transform: rotate(-90 150 150);
            animation: circle-animation 1.5s ease-in-out forwards;
          }

          .tick {
            fill: none;
            stroke: url(#checkmarkGradient);
            stroke-width: 40;
            stroke-linecap: round;
            stroke-linejoin: round;
            opacity: 0;
            animation: tick-animation 1s ease-in-out forwards;
            animation-delay: 1.5s;
          }
        `}
      </style>

      <circle className="circle" cx="150" cy="150" r="130" />
      <polyline className="tick" points="90,160 130,200 210,120" />
    </svg>
  );
};

export default CheckmarkAnimate;
