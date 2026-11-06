import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";
import { Words } from "../Words";

const Pill: React.FC<{ label: string; delay: number; color: string; text: string }> = ({ label, delay, color, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 9, stiffness: 200 } });
  const bounce = 1 + 0.04 * Math.sin((frame - delay) / 5);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 84,
        color: text,
        backgroundColor: color,
        borderRadius: 999,
        padding: "26px 60px",
        scale: String(s * bounce),
        opacity: s > 0.01 ? 1 : 0,
        boxShadow: "0 14px 0 rgba(0,0,0,0.35)",
      }}
    >
      {label}
    </div>
  );
};

export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const arrow = interpolate(Math.sin(frame / 5), [-1, 1], [0, 30]);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #2a1a3a 0%, #07080c 65%)" }} />
      <AbsoluteFill style={{ top: 420, paddingLeft: 90, paddingRight: 90 }}>
        <Words text="Hat's bei dir geklappt?" start={0} size={112} highlight={["geklappt"]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 760, alignItems: "center", gap: 50 }}>
        <Pill label="weg 👻" delay={25} color={C.yellow} text={C.bg} />
        <Pill label="nicht weg 🤨" delay={35} color="#ffffff" text={C.bg} />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 1150,
          left: 560 + arrow,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 64,
          color: C.yellow,
          opacity: interpolate(frame, [50, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        Kommentier! →
      </div>
    </AbsoluteFill>
  );
};
