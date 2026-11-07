import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, sec } from "../theme";
import { Emoji } from "../Emoji";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// VO relativ zu 33,2 s: "Der schnelle Nerv ist isoliert." 0,19 | "Da springt das Signal einfach über die Lücken." 1,99
// "Der langsame muss jedes einzelne Tor nehmen." 4,27
const T = { fast: sec(0.15), jump: sec(1.95), slow: sec(4.25) };

const X0 = 80;
const X1 = 1000;
const GAPS = [80, 310, 540, 770, 1000]; // Ranvier-Schnürringe

export const SMyelin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const top = spring({ frame: frame - T.fast, fps, config: { damping: 200 } });
  const bottom = spring({ frame: frame - T.slow, fps, config: { damping: 200 } });

  // Sprung-Funke oben: springt in 8 Frames von Lücke zu Lücke, Schleife
  const jf = frame - T.jump;
  const hop = 8;
  const cycle = hop * (GAPS.length - 1) + 10;
  const jl = jf >= 0 ? jf % cycle : -1;
  const seg = Math.min(GAPS.length - 2, Math.floor(jl / hop));
  const segT = jl >= 0 && jl < hop * (GAPS.length - 1) ? (jl - seg * hop) / hop : -1;
  const jx = segT >= 0 ? interpolate(segT, [0, 1], [GAPS[seg], GAPS[seg + 1]]) : -999;
  const jy = segT >= 0 ? 620 - Math.sin(segT * Math.PI) * 130 : -999;

  // Kriech-Funke unten
  const cx = frame >= T.slow ? interpolate(frame, [T.slow, T.slow + sec(2.8)], [X0, X1], cl) : -999;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #14223a 0%, #07080c 70%)" }} />

      {/* Oben: isolierter Nerv */}
      <div style={{ opacity: top, translate: `0px ${(1 - top) * -60}px` }}>
        <div style={{ position: "absolute", left: X0, top: 600, width: X1 - X0, height: 40, borderRadius: 20, backgroundColor: "#e9b07a" }} />
        {GAPS.slice(0, -1).map((g, i) => (
          <div key={i} style={{ position: "absolute", left: g + 22, top: 560, width: 230 - 44, height: 120, borderRadius: 60, background: "linear-gradient(180deg,#fff7e0,#f1d9a8)", boxShadow: "0 8px 0 rgba(0,0,0,0.3)" }} />
        ))}
        {GAPS.map((g, i) => {
          const lit = segT >= 0 && Math.abs(jx - g) < 30;
          return <div key={i} style={{ position: "absolute", left: g - 16, top: 604, width: 32, height: 32, borderRadius: "50%", backgroundColor: lit ? C.yellow : "#7c5cff", boxShadow: lit ? `0 0 40px ${C.yellow}` : "none" }} />;
        })}
        {segT >= 0 && (
          <>
            <div style={{ position: "absolute", left: jx - 45, top: jy - 45, width: 90, height: 90, borderRadius: "50%", background: `radial-gradient(circle, ${C.yellow}, rgba(255,225,77,0) 70%)` }} />
            <div style={{ position: "absolute", left: jx - 18, top: jy - 18, width: 36, height: 36, borderRadius: "50%", backgroundColor: "#fff" }} />
          </>
        )}
        <div style={{ position: "absolute", left: 440, top: 330 }}>
          <Emoji e="🐇" size={190} />
        </div>
      </div>

      {/* Unten: nackter Nerv mit vielen Toren */}
      <div style={{ opacity: bottom, translate: `0px ${(1 - bottom) * 60}px` }}>
        <div style={{ position: "absolute", left: X0, top: 1240, width: X1 - X0, height: 40, borderRadius: 20, backgroundColor: "#e9b07a" }} />
        {Array.from({ length: 24 }, (_, i) => {
          const gx = X0 + 20 + i * 38.5;
          const lit = Math.abs(cx - gx) < 30;
          return <div key={i} style={{ position: "absolute", left: gx - 9, top: lit ? 1224 : 1230, width: 18, height: lit ? 72 : 60, borderRadius: 9, backgroundColor: lit ? C.red : "#7c5cff", boxShadow: lit ? `0 0 30px ${C.red}` : "none" }} />;
        })}
        {frame >= T.slow && (
          <div style={{ position: "absolute", left: cx - 50, top: 1210, width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle, ${C.red}, rgba(255,59,92,0) 70%)` }} />
        )}
        <div style={{ position: "absolute", left: 440, top: 1360 }}>
          <Emoji e="🐢" size={190} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
