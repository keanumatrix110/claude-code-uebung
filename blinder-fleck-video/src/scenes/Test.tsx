import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { Words } from "../Words";

// WICHTIG: Kreuz und Punkt bewegen sich NICHT, sonst funktioniert der Test nicht.
// Positionen liegen in der TikTok-Safe-Zone (rechts sind die Buttons, unten die Caption).
const Y = 900;
const CROSS_X = 190;
const DOT_X = 820;

export const Test: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const crossPulse = frame >= 90 && frame < 180 ? 1 + 0.08 * Math.max(0, Math.sin(frame / 4)) : 1;
  // Fortschrittsbalken unten als "Halt durch"-Signal
  const progress = interpolate(frame, [0, 360], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fadeIn }}>
      <AbsoluteFill style={{ top: 230, paddingLeft: 80, paddingRight: 80 }}>
        <Words text="✋ Linkes Auge zu." start={0} end={90} size={96} highlight={["Linkes"]} />
        <Words text="Nur aufs ✚ schauen!" start={90} end={180} size={96} highlight={["Nur", "✚"]} />
        <Words text="Handy langsam näher ran…" start={180} end={270} size={96} highlight={["näher"]} />
        <Words text="…und wieder ein Stück weg." start={270} end={330} size={96} highlight={["weg"]} />
      </AbsoluteFill>

      {/* Kreuz */}
      <div
        style={{
          position: "absolute",
          left: CROSS_X - 60,
          top: Y - 60,
          width: 120,
          height: 120,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 150,
          lineHeight: 1,
          color: "#fff",
          scale: String(crossPulse),
        }}
      >
        <svg width={110} height={110} viewBox="0 0 110 110">
          <rect x={45} y={0} width={20} height={110} fill="#fff" />
          <rect x={0} y={45} width={110} height={20} fill="#fff" />
        </svg>
      </div>

      {/* Punkt */}
      <div
        style={{
          position: "absolute",
          left: DOT_X - 42,
          top: Y - 42,
          width: 84,
          height: 84,
          borderRadius: "50%",
          backgroundColor: C.red,
        }}
      />

      <AbsoluteFill style={{ top: 1180, paddingLeft: 80, paddingRight: 80 }}>
        <Words text="Punkt weg? 👀" start={300} size={140} highlight={["weg"]} highlightColor={C.yellow} />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 120,
          top: 1500,
          width: 840,
          height: 10,
          borderRadius: 5,
          backgroundColor: "rgba(255,255,255,0.15)",
        }}
      >
        <div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 5, backgroundColor: C.yellow }} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 1530,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 44,
          color: C.dim,
        }}
      >
        Weiter nur aufs Kreuz schauen
      </div>
    </AbsoluteFill>
  );
};
