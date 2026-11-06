import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { sec } from "../theme";
import { Emoji } from "../Emoji";

// VO-Zeiten relativ zum Szenenstart (38,5 s)
const T = { intro: sec(0.15), noProblem: sec(1.35), wired: sec(2.95) };

const Octo: React.FC<{ frame: number }> = ({ frame }) => {
  const tentacles = Array.from({ length: 8 }, (_, i) => i);
  return (
    <svg width={760} height={760} viewBox="-200 -200 400 400">
      {tentacles.map((i) => {
        const baseX = -105 + i * 30;
        const ph = frame / 7 + i;
        const w1 = Math.sin(ph) * 30;
        const w2 = Math.cos(ph * 0.8) * 40;
        return (
          <path
            key={i}
            d={`M ${baseX} 20 C ${baseX + w1} 80, ${baseX * 1.4 - w2} 120, ${baseX * 1.6 + w1} 185`}
            stroke="#ff6b8b"
            strokeWidth={26 - Math.abs(i - 3.5) * 1.5}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
      <ellipse cx={0} cy={-50} rx={130} ry={140} fill="#ff6b8b" />
      <ellipse cx={-30} cy={-110} rx={30} ry={18} fill="#ffffff" opacity={0.25} />
      {[-52, 52].map((x) => (
        <g key={x}>
          <circle cx={x} cy={-20} r={34} fill="#fff" />
          <circle cx={x + Math.sin(frame / 10) * 8} cy={-18} r={16} fill="#111" />
        </g>
      ))}
    </svg>
  );
};

export const Octopus: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - T.intro, fps, config: { damping: 12, stiffness: 140 } });
  const check = spring({ frame: frame - T.noProblem, fps, config: { damping: 8, stiffness: 220 } });
  const plug = spring({ frame: frame - T.wired, fps, config: { damping: 10, stiffness: 180 } });
  const bob = Math.sin(frame / 12) * 18;
  return (
    <AbsoluteFill style={{ backgroundColor: "#061a2b" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #0d4a6e 0%, #061a2b 70%)" }} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          scale: String(interpolate(s, [0, 1], [0.4, 1])),
          translate: `0px ${bob + (1 - s) * 500 - 80}px`,
        }}
      >
        <div style={{ position: "relative" }}>
          <Octo frame={frame} />
          <div style={{ position: "absolute", right: -20, top: 0, scale: String(check), opacity: check > 0.01 ? 1 : 0 }}>
            <Emoji e="✅" size={210} />
          </div>
          <div style={{ position: "absolute", left: -30, top: 40, scale: String(plug), rotate: `${(1 - plug) * -60}deg`, opacity: plug > 0.01 ? 1 : 0 }}>
            <Emoji e="🔌" size={170} />
          </div>
          {frame >= T.wired && (
            <div style={{ position: "absolute", left: 300, top: 180, opacity: 0.5 + 0.5 * Math.sin(frame / 3) }}>
              <Emoji e="✨" size={120} />
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
