import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, sec } from "../theme";
import { Emoji } from "../Emoji";
import { ToeHit } from "./Toe";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// VO relativ zu 40,3 s: "Stoß dir also das nächste Mal den Zeh und zähl mit." 0,14 bis 2,86
// "Eins…" 3,21 | "und dann kommt's." 4,34 | "Merkst du's jetzt?" 5,62
const T = { hit: sec(1.5), one: sec(3.2), second: sec(4.4), ask: sec(5.6) };

export const SCta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const one = spring({ frame: frame - T.one, fps, config: { damping: 8, stiffness: 220 } });
  const ouch = spring({ frame: frame - T.second, fps, config: { damping: 8, stiffness: 240 } });
  const ask = spring({ frame: frame - T.ask, fps, config: { damping: 9, stiffness: 200 } });
  const arrow = interpolate(Math.sin(frame / 5), [-1, 1], [0, 30]);
  const dim = interpolate(frame, [T.ask, T.ask + 8], [0, 0.7], cl);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, #3a1620 0%, #07080c 65%)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", translate: "0px 200px" }}>
        <ToeHit hit={T.hit} second={T.second} />
      </AbsoluteFill>
      {frame >= T.one && frame < T.second && (
        <AbsoluteFill style={{ top: 200, height: 450, justifyContent: "center", alignItems: "center" }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 380, color: C.yellow, scale: String(one), textShadow: "0 12px 0 rgba(0,0,0,0.5)" }}>1</div>
        </AbsoluteFill>
      )}
      {frame >= T.second && frame < T.ask && (
        <AbsoluteFill style={{ top: 180, height: 480, justifyContent: "center", alignItems: "center" }}>
          <div style={{ scale: String(ouch), rotate: `${Math.sin(frame / 2) * 6}deg` }}>
            <Emoji e="😖" size={330} />
          </div>
        </AbsoluteFill>
      )}
      {frame >= T.ask && (
        <AbsoluteFill style={{ backgroundColor: `rgba(7,8,12,${dim})` }}>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", translate: "0px -120px" }}>
            <div style={{ scale: String(ask), rotate: `${Math.sin(frame / 8) * 6}deg` }}>
              <Emoji e="🤔" size={380} />
            </div>
          </AbsoluteFill>
          <div style={{ position: "absolute", top: 1130, left: 640 + arrow, display: "flex", alignItems: "center", gap: 16, scale: String(ask) }}>
            <Emoji e="💬" size={130} />
            <svg width={120} height={80} viewBox="0 0 120 80">
              <rect x={0} y={28} width={80} height={24} fill={C.yellow} />
              <polygon points="70,0 120,40 70,80" fill={C.yellow} />
            </svg>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
