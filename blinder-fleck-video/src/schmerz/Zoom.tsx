import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, sec } from "../theme";
import { Emoji } from "../Emoji";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// VO relativ zu 18,7 s: "Und jetzt kommt's:" 0,19 | "Da fließt gar kein Strom." 1,24 | "Dein Nerv läuft mit Salz." 3,11
const T = { dive: sec(0.15), noPower: sec(1.3), salt: sec(3.1) };

export const SZoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dive = interpolate(frame, [T.dive, T.noPower], [0, 1], cl);
  const bolt = spring({ frame: frame - T.noPower, fps, config: { damping: 10, stiffness: 200 } });
  const ban = spring({ frame: frame - T.noPower - 12, fps, config: { damping: 7, stiffness: 280 } });
  const boltOut = interpolate(frame, [T.salt - 8, T.salt], [1, 0], cl);
  const salt = spring({ frame: frame - T.salt, fps, config: { damping: 9, stiffness: 180 } });
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      {/* Tunnel-Zoom in den Nerv */}
      {Array.from({ length: 9 }, (_, i) => {
        const r = ((i / 9 + dive * 1.6 + frame / 200) % 1) * 1500;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 - r / 2,
              top: 860 - r / 2,
              width: r,
              height: r,
              borderRadius: "50%",
              border: `${6 + r / 60}px solid ${i % 2 ? C.cyan : "#e9b07a"}`,
              opacity: 0.12 + 0.35 * (r / 1500),
            }}
          />
        );
      })}
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: interpolate(frame, [T.noPower - 6, T.noPower - 2, T.noPower + 4], [0, 0.8, 0], cl) }} />
      {frame >= T.noPower && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", translate: "0px -100px", opacity: boltOut }}>
          <div style={{ position: "relative", scale: String(bolt) }}>
            <Emoji e="⚡" size={420} />
            <div style={{ position: "absolute", left: -40, top: -40, scale: String(ban), opacity: ban > 0.01 ? 1 : 0 }}>
              <Emoji e="🚫" size={500} />
            </div>
          </div>
        </AbsoluteFill>
      )}
      {frame >= T.salt && (
        <>
          {Array.from({ length: 40 }, (_, i) => {
            const x = 300 + random(`sx${i}`) * 480;
            const delay = random(`sd${i}`) * 50;
            const y = 900 + (frame - T.salt - delay) * (9 + random(`sv${i}`) * 6);
            return frame - T.salt > delay ? (
              <div key={i} style={{ position: "absolute", left: x, top: y, width: 16, height: 16, backgroundColor: "#fff", rotate: `${i * 37}deg`, opacity: 0.9 }} />
            ) : null;
          })}
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", translate: "0px -200px" }}>
            <div style={{ scale: String(salt), rotate: `${170 + Math.sin(frame / 3) * 14}deg` }}>
              <Emoji e="🧂" size={420} />
            </div>
          </AbsoluteFill>
        </>
      )}
    </AbsoluteFill>
  );
};
