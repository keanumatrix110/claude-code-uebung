import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, sec } from "../theme";
import { Emoji } from "../Emoji";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// VO relativ zu 12,93 s: "Der eine ist so schnell wie ein Auto in der Stadt." 0,14
// "Der andere ungefähr so schnell, wie du gehst." 3,07
const T = { car: sec(0.14), walk: sec(3.07) };

const Lane: React.FC<{ y: number; color: string; on: number }> = ({ y, color, on }) => (
  <div style={{ position: "absolute", left: 0, top: y, width: 1080, height: 300, backgroundColor: "#1a1d24", opacity: on }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 10, backgroundColor: color }} />
    <div style={{ position: "absolute", left: 0, top: 290, width: 1080, height: 10, backgroundColor: color }} />
    <div style={{ position: "absolute", left: 0, top: 145, width: 1080, height: 10, background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 60px, transparent 60px 120px)" }} />
  </div>
);

export const SSpeeds: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lane1 = spring({ frame: frame - T.car + 4, fps, config: { damping: 200 } });
  const lane2 = spring({ frame: frame - T.walk + 4, fps, config: { damping: 200 } });
  // Auto rast mehrfach durch
  const carCycle = sec(1.1);
  const carX = frame >= T.car ? interpolate((frame - T.car) % carCycle, [0, carCycle], [-350, 1200]) : -400;
  const walkX = interpolate(frame, [T.walk, T.walk + sec(3)], [-60, 260], cl);
  const step = Math.abs(Math.sin(frame / 4)) * -16;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Lane y={420} color={C.cyan} on={lane1} />
      <Lane y={1000} color={C.red} on={lane2} />
      {frame >= T.car && (
        <>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ position: "absolute", left: carX - 260 - i * 30, top: 500 + i * 50, width: 200, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.6)" }} />
          ))}
          <div style={{ position: "absolute", left: carX, top: 440, scale: "-1 1" }}>
            <Emoji e="🚗" size={240} />
          </div>
          <div style={{ position: "absolute", left: 60, top: 230, scale: String(lane1) }}>
            <Emoji e="⚡" size={140} />
          </div>
        </>
      )}
      {frame >= T.walk && (
        <>
          <div style={{ position: "absolute", left: walkX, top: 1010 + step, scale: "-1 1" }}>
            <Emoji e="🚶" size={250} />
          </div>
          <div style={{ position: "absolute", left: 60, top: 810, scale: String(lane2) }}>
            <Emoji e="😖" size={140} />
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
