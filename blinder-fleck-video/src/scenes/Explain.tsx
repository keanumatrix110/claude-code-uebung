import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT } from "../theme";
import { Words } from "../Words";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CX = 540;
const CY = 700;
const R = 300;
const DISC_ANGLE = 0.32; // rad, Sehnervenaustritt leicht neben der Sehachse
const discX = CX + R * Math.cos(DISC_ANGLE);
const discY = CY + R * Math.sin(DISC_ANGLE);
const foveaX = CX + R;

const EyeSection: React.FC<{ frame: number }> = ({ frame }) => {
  const ray = interpolate(frame, [10, 50], [1, 0], cl);
  const nerveGlow = interpolate(frame, [30, 45, 90, 100], [0, 1, 1, 0.4], cl);
  const ring = interpolate(frame, [100, 115], [0, 1], cl);
  const ringPulse = 1 + 0.12 * Math.sin(frame / 4);
  const rays = [-120, -60, 0, 60, 120];
  return (
    <svg width={1080} height={1200} viewBox="0 100 1080 1200" style={{ position: "absolute", top: 0, left: 0 }}>
      {/* Lichtstrahlen */}
      {rays.map((dy, i) => {
        const len = 900;
        return (
          <path
            key={i}
            d={`M 0 ${CY + dy} L ${CX - R + 70} ${CY + dy * 0.9} L ${foveaX - 6} ${CY}`}
            stroke={C.yellow}
            strokeWidth={4}
            fill="none"
            opacity={0.75}
            strokeDasharray={len}
            strokeDashoffset={len * ray}
          />
        );
      })}
      {/* Sehnerv */}
      <path
        d={`M ${discX - 10} ${discY - 30} C ${discX + 80} ${discY - 20}, ${discX + 140} ${discY + 60}, 1100 ${discY + 210}
            L 1100 ${discY + 330} C ${discX + 110} ${discY + 160}, ${discX + 60} ${discY + 60}, ${discX - 10} ${discY + 34} Z`}
        fill="#e9b07a"
        stroke={nerveGlow > 0.5 ? C.yellow : "#a8754a"}
        strokeWidth={4 + nerveGlow * 6}
      />
      {/* Augapfel */}
      <circle cx={CX} cy={CY} r={R} fill="#f4f1ea" stroke="#fff" strokeWidth={6} />
      {/* Netzhaut */}
      <path
        d={`M ${CX + R * Math.cos(-2.1)} ${CY + R * Math.sin(-2.1)} A ${R} ${R} 0 1 1 ${CX + R * Math.cos(2.1)} ${CY + R * Math.sin(2.1)}`}
        stroke={C.red}
        strokeOpacity={0.55}
        strokeWidth={22}
        fill="none"
      />
      {/* Hornhaut + Iris + Linse */}
      <path d={`M ${CX - R + 40} ${CY - 120} Q ${CX - R - 70} ${CY} ${CX - R + 40} ${CY + 120}`} stroke={C.cyan} strokeWidth={6} fill="rgba(77,225,255,0.12)" />
      <rect x={CX - R + 52} y={CY - 140} width={14} height={80} fill="#1fa3c8" />
      <rect x={CX - R + 52} y={CY + 60} width={14} height={80} fill="#1fa3c8" />
      <ellipse cx={CX - R + 90} cy={CY} rx={34} ry={74} fill="rgba(77,225,255,0.35)" stroke={C.cyan} strokeWidth={4} />
      {/* Blinder Fleck */}
      <circle cx={discX} cy={discY} r={30} fill="#000" />
      <circle
        cx={discX}
        cy={discY}
        r={58 * ringPulse}
        fill="none"
        stroke={C.red}
        strokeWidth={10}
        opacity={ring}
      />
      <g opacity={ring}>
        <line x1={discX} y1={discY + 58} x2={discX - 40} y2={discY + 200} stroke={C.red} strokeWidth={6} />
      </g>
    </svg>
  );
};

// Gestreiftes Muster mit Loch, das "aufgefüllt" wird
const FillIn: React.FC<{ frame: number }> = ({ frame }) => {
  const appear = interpolate(frame, [0, 12], [0, 1], cl);
  const hole = interpolate(frame, [30, 62], [1, 0], cl);
  const sweep = interpolate(frame, [30, 62], [0, 360], cl);
  return (
    <div
      style={{
        position: "absolute",
        left: 140,
        top: 330,
        width: 800,
        height: 800,
        borderRadius: 40,
        overflow: "hidden",
        opacity: appear,
        background: `repeating-linear-gradient(90deg, ${C.yellow} 0 50px, ${C.bg} 50px 100px)`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 250,
          top: 250,
          width: 300,
          height: 300,
          borderRadius: "50%",
          backgroundColor: "#000",
          opacity: hole,
        }}
      />
      {frame >= 30 && frame < 66 && (
        <div
          style={{
            position: "absolute",
            left: 230,
            top: 230,
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: `conic-gradient(from ${sweep}deg, rgba(255,255,255,0.9), rgba(255,255,255,0) 30%)`,
            WebkitMask: "radial-gradient(circle, transparent 62%, #000 64%)",
            mask: "radial-gradient(circle, transparent 62%, #000 64%)",
          }}
        />
      )}
    </div>
  );
};

export const Explain: React.FC = () => {
  const frame = useCurrentFrame();
  const eyeOpacity = interpolate(frame, [0, 12, 165, 180], [0, 1, 1, 0], cl);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #16233a 0%, #07080c 65%)" }} />
      <AbsoluteFill style={{ opacity: eyeOpacity }}>
        <EyeSection frame={frame} />
        {frame >= 100 && (
          <div
            style={{
              position: "absolute",
              left: discX - 300,
              top: discY + 100,
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 56,
              color: C.red,
              textShadow: "0 4px 0 rgba(0,0,0,0.6)",
              opacity: interpolate(frame, [100, 112], [0, 1], cl),
            }}
          >
            Blinder Fleck
          </div>
        )}
      </AbsoluteFill>
      {frame >= 170 && <FillIn frame={frame - 170} />}

      <AbsoluteFill style={{ top: 1180, paddingLeft: 90, paddingRight: 90 }}>
        <Words text="Hier verlässt der Sehnerv dein Auge." start={0} end={100} size={88} highlight={["Sehnerv"]} />
        <Words text="Keine einzige Sehzelle." start={100} end={170} size={110} highlight={["Keine"]} highlightColor={C.red} />
        <Words text="Dein Gehirn malt die Lücke einfach zu." start={175} end={235} size={88} highlight={["malt", "Lücke"]} />
        <Words text="Es erfindet ein Stück deines Bildes." start={235} size={92} highlight={["erfindet"]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
