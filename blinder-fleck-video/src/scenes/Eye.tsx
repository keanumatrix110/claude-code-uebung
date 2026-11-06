import React from "react";
import { C } from "../theme";

// Stilisiertes Auge von vorne
export const Eye: React.FC<{ size: number; lookX?: number; lookY?: number; blink?: number }> = ({
  size,
  lookX = 0,
  lookY = 0,
  blink = 0,
}) => {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg width={size} height={size * 0.62} viewBox="-100 -62 200 124">
      <defs>
        <radialGradient id={`iris${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0b2a3a" />
          <stop offset="55%" stopColor="#1fa3c8" />
          <stop offset="100%" stopColor="#0a3a52" />
        </radialGradient>
        <clipPath id={`lid${id}`}>
          <path d={`M -95 0 Q 0 ${-70 * (1 - blink)} 95 0 Q 0 ${70 * (1 - blink)} -95 0 Z`} />
        </clipPath>
      </defs>
      <path
        d={`M -95 0 Q 0 ${-70 * (1 - blink)} 95 0 Q 0 ${70 * (1 - blink)} -95 0 Z`}
        fill="#f4f1ea"
        stroke={C.text}
        strokeWidth={3}
      />
      <g clipPath={`url(#lid${id})`}>
        <circle cx={lookX} cy={lookY} r={34} fill={`url(#iris${id})`} />
        <circle cx={lookX} cy={lookY} r={14} fill="#000" />
        <circle cx={lookX - 9} cy={lookY - 10} r={5} fill="#fff" opacity={0.9} />
      </g>
    </svg>
  );
};
