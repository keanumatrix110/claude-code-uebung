import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, sec } from "../theme";
import { Emoji } from "../Emoji";
import { ToeHit } from "./Toe";

// VO: "Wenn du dir den Zeh stößt, spürst du den Schmerz zweimal." 0,1 bis 3,8 s
//     "Und du hast es noch nie gemerkt." 4,5 bis 6,2 s
const HIT = sec(1.0);
const BOLT1 = sec(2.7);
const BOLT2 = sec(3.25);
const MIND = sec(4.5);

export const SHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b1 = spring({ frame: frame - BOLT1, fps, config: { damping: 8, stiffness: 240 } });
  const b2 = spring({ frame: frame - BOLT2, fps, config: { damping: 8, stiffness: 240 } });
  const mind = spring({ frame: frame - MIND, fps, config: { damping: 9, stiffness: 180 } });
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, #3a1620 0%, #07080c 65%)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", translate: "0px 150px" }}>
        <ToeHit hit={HIT} />
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 230, height: 400, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 60 }}>
        <div style={{ scale: String(b1), rotate: `${(1 - b1) * -40}deg`, opacity: b1 > 0.01 ? 1 : 0 }}>
          <Emoji e="⚡" size={260} />
        </div>
        <div style={{ scale: String(b2), rotate: `${(1 - b2) * 40}deg`, opacity: b2 > 0.01 ? 1 : 0, filter: "hue-rotate(-50deg) saturate(1.6)" }}>
          <Emoji e="⚡" size={260} />
        </div>
      </AbsoluteFill>
      {frame >= MIND && (
        <AbsoluteFill style={{ backgroundColor: `rgba(7,8,12,${0.75 * Math.min(1, mind)})`, justifyContent: "center", alignItems: "center" }}>
          <div style={{ scale: String(mind), rotate: `${Math.sin(frame / 6) * 5}deg` }}>
            <Emoji e="🤯" size={460} />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
