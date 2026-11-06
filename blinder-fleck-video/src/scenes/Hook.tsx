import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, sec } from "../theme";
import { Emoji } from "../Emoji";
import { Eye } from "./Eye";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// VO: "Du siehst gerade nicht alles." 0,0 bis 1,65 s | "Und dein Gehirn verheimlicht es dir." 2,4 bis 4,2 s
const BRAIN = sec(2.3);
const SHH = sec(3.3);

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glitch = (frame >= 6 && frame < 12) || (frame >= 38 && frame < 44) || (frame >= BRAIN - 4 && frame < BRAIN + 2);
  const jx = glitch ? (random(`x${frame}`) - 0.5) * 70 : 0;
  const jy = glitch ? (random(`y${frame}`) - 0.5) * 30 : 0;
  const look = Math.sin(frame / 9) * 22;
  const hole = interpolate(frame, [12, 22, 48, 60], [0, 1, 1, 0], cl);
  const eyeOut = interpolate(frame, [BRAIN - 6, BRAIN + 6], [1, 0], cl);
  const brain = spring({ frame: frame - BRAIN, fps, config: { damping: 10, stiffness: 160 } });
  const shh = spring({ frame: frame - SHH, fps, config: { damping: 9, stiffness: 220 } });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #1b2a44 0%, #07080c 62%)" }} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: eyeOut,
          scale: String(interpolate(frame, [0, BRAIN], [1, 1.25], cl)),
          translate: `${jx}px ${jy - 120}px`,
        }}
      >
        <div style={{ position: "relative" }}>
          {glitch && (
            <div style={{ position: "absolute", left: 22, top: 0, opacity: 0.6, filter: "hue-rotate(140deg)" }}>
              <Eye size={900} lookX={look} />
            </div>
          )}
          <Eye size={900} lookX={look} />
          <div
            style={{
              position: "absolute",
              left: 570,
              top: 165,
              width: 210,
              height: 210,
              borderRadius: "50%",
              background: "radial-gradient(circle, #000 55%, rgba(0,0,0,0) 72%)",
              opacity: hole,
            }}
          />
        </div>
      </AbsoluteFill>

      {frame >= BRAIN && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", translate: `${jx}px -120px` }}>
          <div style={{ position: "relative", scale: String(brain), rotate: `${(1 - brain) * -20}deg` }}>
            <Emoji e="🧠" size={480} />
            <div
              style={{
                position: "absolute",
                right: -90,
                bottom: -40,
                scale: String(shh),
                opacity: shh > 0.01 ? 1 : 0,
              }}
            >
              <Emoji e="🤫" size={260} />
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
