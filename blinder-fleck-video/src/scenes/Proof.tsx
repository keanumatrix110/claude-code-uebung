import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, sec } from "../theme";
import { Emoji } from "../Emoji";

// VO: "Ich beweis es dir." 0,3 bis 1,2 s | "Jetzt." ab 1,4 s
const NOW = sec(1.38);

export const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame, fps, config: { damping: 12, stiffness: 180 } });
  const punch = spring({ frame: frame - NOW, fps, config: { damping: 7, stiffness: 300 } });
  const shake = frame >= NOW && frame < NOW + 12 ? Math.sin(frame * 3) * 16 : 0;
  const flash = interpolate(frame, [NOW, NOW + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: C.yellow }}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          translate: `${shake}px -80px`,
          scale: String(interpolate(inS, [0, 1], [0.3, 1]) * (frame >= NOW ? interpolate(punch, [0, 1], [1.6, 1.15]) : 1)),
        }}
      >
        <Emoji e="🫵" size={620} />
      </AbsoluteFill>
      {frame >= NOW && <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flash }} />}
    </AbsoluteFill>
  );
};
