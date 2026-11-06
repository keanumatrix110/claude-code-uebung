import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, sec } from "../theme";
import { Emoji } from "../Emoji";

// VO-Zeiten relativ zum Szenenstart (44,4 s)
const T = { ask: sec(0.15), weg: sec(1.6), nichtWeg: sec(2.2), comment: sec(2.9) };

const Pill: React.FC<{ label: string; at: number; color: string }> = ({ label, at, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 8, stiffness: 220 } });
  const bounce = 1 + 0.04 * Math.sin((frame - at) / 5);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 96,
        color: C.bg,
        backgroundColor: color,
        borderRadius: 999,
        padding: "30px 70px",
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
  const { fps } = useVideoConfig();
  const think = spring({ frame: frame - T.ask, fps, config: { damping: 10, stiffness: 180 } });
  const bubble = spring({ frame: frame - T.comment, fps, config: { damping: 9, stiffness: 200 } });
  const arrow = interpolate(Math.sin(frame / 5), [-1, 1], [0, 30]);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #2a1a3a 0%, #07080c 65%)" }} />
      <AbsoluteFill style={{ top: 250, height: 380, justifyContent: "center", alignItems: "center" }}>
        <div style={{ scale: String(think), rotate: `${Math.sin(frame / 8) * 6}deg` }}>
          <Emoji e="🤔" size={300} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 700, alignItems: "center", gap: 50 }}>
        <Pill label="weg 👻" at={T.weg} color={C.yellow} />
        <Pill label="nicht weg 🤨" at={T.nichtWeg} color="#ffffff" />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 1130,
          left: 640 + arrow,
          display: "flex",
          alignItems: "center",
          gap: 16,
          scale: String(bubble),
          opacity: bubble > 0.01 ? 1 : 0,
        }}
      >
        <Emoji e="💬" size={130} />
        <svg width={120} height={80} viewBox="0 0 120 80">
          <rect x={0} y={28} width={80} height={24} fill={C.yellow} />
          <polygon points="70,0 120,40 70,80" fill={C.yellow} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
