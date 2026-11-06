import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { Words } from "../Words";
import { Eye } from "./Eye";

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  // Glitch-Momente
  const glitch = (frame >= 8 && frame < 14) || (frame >= 52 && frame < 58) || (frame >= 80 && frame < 84);
  const jx = glitch ? (random(`x${frame}`) - 0.5) * 60 : 0;
  const jy = glitch ? (random(`y${frame}`) - 0.5) * 30 : 0;
  const zoom = interpolate(frame, [0, 100], [1, 1.15]);
  const look = Math.sin(frame / 9) * 22;
  // "Loch" im Bild, das kurz aufblitzt
  const holeOpacity = interpolate(frame, [20, 30, 45, 60], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle at 50% 35%, #1b2a44 0%, #07080c 60%)",
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          top: 330,
          height: 700,
          scale: String(zoom),
          translate: `${jx}px ${jy}px`,
        }}
      >
        <div style={{ position: "relative" }}>
          {glitch && (
            <div style={{ position: "absolute", left: 18, top: 0, opacity: 0.6, mixBlendMode: "screen", filter: "hue-rotate(140deg)" }}>
              <Eye size={820} lookX={look} />
            </div>
          )}
          <Eye size={820} lookX={look} />
          <div
            style={{
              position: "absolute",
              left: 520,
              top: 150,
              width: 190,
              height: 190,
              borderRadius: "50%",
              background: "radial-gradient(circle, #000 55%, rgba(0,0,0,0) 72%)",
              opacity: holeOpacity,
            }}
          />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ top: 1060, paddingLeft: 90, paddingRight: 90 }}>
        <Words text="Du siehst gerade" start={0} end={50} size={92} />
        <Words text="NICHT ALLES." start={10} end={50} size={150} highlight={["NICHT", "ALLES"]} highlightColor={C.red} />
        <Words text="Und dein Gehirn" start={50} size={92} />
        <Words text="verheimlicht es dir." start={60} size={104} highlight={["verheimlicht"]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
