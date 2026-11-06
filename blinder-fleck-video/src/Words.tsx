import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "./theme";

type Props = {
  text: string;
  start: number;
  size?: number;
  highlight?: string[];
  highlightColor?: string;
  end?: number;
  style?: React.CSSProperties;
  noShadow?: boolean;
};

// Wort-für-Wort-Untertitel im TikTok-Stil: jedes Wort "ploppt" kurz nacheinander rein.
export const Words: React.FC<Props> = ({
  text,
  start,
  size = 96,
  highlight = [],
  highlightColor = C.yellow,
  end,
  style,
  noShadow = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < start) return null;
  if (end !== undefined && frame >= end) return null;

  const words = text.split(" ");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: `0 ${size * 0.28}px`,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.12,
        textAlign: "center",
        color: C.text,
        letterSpacing: -1,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const s = spring({
          frame: frame - start - i * 3,
          fps,
          config: { damping: 11, stiffness: 220, mass: 0.6 },
        });
        const clean = w.replace(/[.,!?…:]/g, "");
        const isHi = highlight.includes(clean);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: s > 0.01 ? 1 : 0,
              scale: String(0.55 + 0.45 * s),
              translate: `0px ${(1 - s) * 40}px`,
              color: isHi ? highlightColor : (style?.color ?? C.text),
              textShadow: noShadow ? "none" : "0 6px 0 rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.6)",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
