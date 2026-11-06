import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";
import { Words } from "../Words";

export const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 22, fps, config: { damping: 8, stiffness: 260 } });
  const shake = frame > 22 && frame < 34 ? Math.sin(frame * 3) * 12 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.yellow, justifyContent: "center", alignItems: "center" }}>
      <Words text="Ich beweis es dir." start={0} size={100} style={{ color: C.bg }} noShadow />
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 300,
          color: C.bg,
          letterSpacing: -8,
          marginTop: 30,
          scale: String(interpolate(s, [0, 1], [2.4, 1])),
          opacity: s > 0.01 ? 1 : 0,
          translate: `${shake}px 0px`,
        }}
      >
        JETZT.
      </div>
    </AbsoluteFill>
  );
};
