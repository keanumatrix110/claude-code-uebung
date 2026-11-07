import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, sec } from "../theme";
import { Emoji } from "../Emoji";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// VO relativ zu 6,4 s: "Erst kommt der scharfe Stich." 0,2 | "Dann der dumpfe Schmerz." 2,05
// "Zwei verschiedene Nerven." 3,8 | "Zwei Geschwindigkeiten." 5,25
const T = { fast: sec(0.2), slow: sec(2.05), nerves: sec(3.8), speeds: sec(5.25) };

const TOP = 420;
const BOTTOM = 1420;
// Punkt auf einer welligen Nervenbahn, t von 0 (Fuß) bis 1 (Gehirn)
const pt = (baseX: number, t: number, phase: number) => {
  const y = BOTTOM - (BOTTOM - TOP) * t;
  const x = baseX + Math.sin(t * Math.PI * 3 + phase) * 45;
  return { x, y };
};
const pathD = (baseX: number, phase: number) => {
  let d = "";
  for (let i = 0; i <= 60; i++) {
    const p = pt(baseX, i / 60, phase);
    d += `${i === 0 ? "M" : "L"} ${p.x} ${p.y} `;
  }
  return d;
};

export const SWaves: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fastT = interpolate(frame, [T.fast, T.fast + 18], [0, 1], cl);
  const slowT = interpolate(frame, [T.slow, T.slow + sec(3.4)], [0, 1], cl);
  const hl = frame >= T.nerves ? 1 + 0.5 * Math.abs(Math.sin((frame - T.nerves) / 5)) : 1;
  const fastHit = spring({ frame: frame - T.fast - 18, fps, config: { damping: 8, stiffness: 240 } });
  const slowHit = spring({ frame: frame - T.slow - sec(3.4), fps, config: { damping: 10, stiffness: 160 } });
  const icons = spring({ frame: frame - T.speeds, fps, config: { damping: 10, stiffness: 200 } });
  const lines: [number, number, string, number][] = [
    [380, 0, C.cyan, fastT],
    [700, 1.5, C.red, slowT],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #14223a 0%, #07080c 65%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        {lines.map(([x, ph, col, t], i) => {
          const p = pt(x, t, ph);
          return (
            <g key={i}>
              <path d={pathD(x, ph)} stroke={col} strokeOpacity={0.25 * hl} strokeWidth={14 * hl} fill="none" strokeLinecap="round" />
              <path d={pathD(x, ph)} stroke={col} strokeOpacity={0.6} strokeWidth={5} fill="none" />
              {t > 0 && t < 1 && (
                <>
                  <circle cx={p.x} cy={p.y} r={46} fill={col} opacity={0.25} />
                  <circle cx={p.x} cy={p.y} r={24} fill={col} />
                </>
              )}
            </g>
          );
        })}
      </svg>
      {/* Gehirn oben, Fuß unten */}
      <div style={{ position: "absolute", left: 540 - 150, top: TOP - 290, scale: String(1 + 0.15 * fastHit * (frame < T.slow ? 1 : 0) + 0.12 * slowHit) }}>
        <Emoji e="🧠" size={300} />
      </div>
      <div style={{ position: "absolute", left: 540 - 130, top: BOTTOM - 20 }}>
        <Emoji e="🦶" size={260} />
      </div>
      {/* Eintreffen */}
      <div style={{ position: "absolute", left: 120, top: TOP - 250, scale: String(fastHit), opacity: fastHit > 0.01 ? 1 : 0 }}>
        <Emoji e="⚡" size={170} />
      </div>
      <div style={{ position: "absolute", left: 780, top: TOP - 250, scale: String(slowHit), opacity: slowHit > 0.01 ? 1 : 0 }}>
        <Emoji e="😖" size={170} />
      </div>
      {/* Geschwindigkeits-Symbole */}
      <div style={{ position: "absolute", left: 380 - 230, top: 880, scale: String(icons), opacity: icons > 0.01 ? 1 : 0 }}>
        <Emoji e="🐇" size={170} />
      </div>
      <div style={{ position: "absolute", left: 700 + 70, top: 880, scale: String(icons), opacity: icons > 0.01 ? 1 : 0 }}>
        <Emoji e="🐢" size={170} />
      </div>
    </AbsoluteFill>
  );
};
