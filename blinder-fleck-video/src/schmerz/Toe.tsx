import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";
import { Emoji } from "../Emoji";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Fuß knallt gegen ein Tischbein. hit = Frame des Aufpralls.
export const ToeHit: React.FC<{ hit: number; second?: number }> = ({ hit, second }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const x = interpolate(frame, [hit - 14, hit], [-380, 0], { ...cl, easing: (t) => t * t });
  const recoil = frame >= hit ? Math.sin((frame - hit) / 2) * 14 * Math.exp(-(frame - hit) / 8) : 0;
  const boom1 = spring({ frame: frame - hit, fps, config: { damping: 8, stiffness: 260 } });
  const boom2 = second !== undefined ? spring({ frame: frame - second, fps, config: { damping: 8, stiffness: 260 } }) : 0;
  const shake = (f: number) => (frame >= f && frame < f + 10 ? Math.sin(frame * 3) * 14 : 0);
  return (
    <div style={{ position: "relative", width: 900, height: 700, translate: `${shake(hit) + (second ? shake(second) : 0)}px 0px` }}>
      {/* Tischbein */}
      <div style={{ position: "absolute", left: 600, top: 0, width: 110, height: 700, borderRadius: 10, background: "linear-gradient(90deg,#8a5a32,#b07842,#7a4c28)" }} />
      <div style={{ position: "absolute", left: 470, top: -40, width: 430, height: 70, borderRadius: 10, background: "#b07842" }} />
      {/* Fuß */}
      <div style={{ position: "absolute", left: 210 + x + recoil, top: 380, rotate: "0deg", scale: "-1 1" }}>
        <Emoji e="🦶" size={360} />
      </div>
      {/* Aufprall */}
      <div style={{ position: "absolute", left: 470, top: 360, scale: String(boom1), opacity: frame >= hit ? interpolate(frame, [hit + 20, hit + 40], [1, 0.0], cl) : 0 }}>
        <Emoji e="💥" size={240} />
      </div>
      {second !== undefined && frame >= second && (
        <div style={{ position: "absolute", left: 360, top: 150, scale: String(boom2 * (1 + 0.06 * Math.sin(frame / 3))) }}>
          <svg width={360} height={360} viewBox="-100 -100 200 200">
            {[0, 1, 2].map((i) => (
              <circle key={i} r={30 + ((frame - second + i * 10) % 30) * 2.4} fill="none" stroke={C.red} strokeWidth={8} opacity={1 - ((frame - second + i * 10) % 30) / 30} />
            ))}
          </svg>
        </div>
      )}
    </div>
  );
};
