import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";
import { Words } from "../Words";

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
  const s = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const bob = Math.sin(frame / 12) * 18;
  return (
    <AbsoluteFill style={{ backgroundColor: "#061a2b" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, #0d4a6e 0%, #061a2b 70%)" }} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          top: 260,
          scale: String(interpolate(s, [0, 1], [0.4, 1])),
          translate: `0px ${bob + (1 - s) * 400}px`,
        }}
      >
        <Octo frame={frame} />
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 1100, paddingLeft: 90, paddingRight: 90 }}>
        <Words text="Und ein Oktopus?" start={0} end={45} size={110} highlight={["Oktopus"]} highlightColor={C.cyan} />
        <Words text="KEIN blinder Fleck." start={45} end={150} size={120} highlight={["KEIN"]} highlightColor={C.yellow} />
        <Words text="Seine Augen sind besser verkabelt als unsere." start={80} size={64} highlight={["besser"]} style={{ marginTop: 24 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
