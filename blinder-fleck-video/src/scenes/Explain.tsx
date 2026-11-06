import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, sec } from "../theme";
import { Emoji } from "../Emoji";

// VO-Zeiten relativ zum Szenenstart (22,6 s)
const T = {
  intro: sec(0.1), // "Das ist dein blinder Fleck!"
  nerve: sec(1.6), // "Genau da, wo der Sehnerv dein Auge verlässt,"
  noCells: sec(4.1), // "hast du keine einzige Sehzelle."
  blind: sec(6.55), // "Diese Stelle ist komplett blind."
  brain: sec(8.85), // "Und dein Gehirn?"
  paint: sec(9.85), // "Malt die Lücke einfach zu."
  fill: sec(11.4), // "Mit dem, was es erwartet."
  invent: sec(13.1), // "Es erfindet also gerade ein Stück von deinem Bild."
};

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CX = 540;
const CY = 700;
const R = 300;
const DISC_ANGLE = 0.32; // rad, Sehnervenaustritt leicht neben der Sehachse
const discX = CX + R * Math.cos(DISC_ANGLE);
const discY = CY + R * Math.sin(DISC_ANGLE);
const foveaX = CX + R;

const EyeSection: React.FC<{ frame: number }> = ({ frame }) => {
  const ray = interpolate(frame, [T.intro, T.intro + 40], [1, 0], cl);
  const nerveGlow = interpolate(frame, [T.nerve, T.nerve + 12, T.noCells, T.noCells + 10], [0, 1, 1, 0.4], cl);
  const ring = interpolate(frame, [T.noCells, T.noCells + 15], [0, 1], cl);
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
  const F0 = T.fill - T.paint;
  const F1 = F0 + sec(1.3);
  const hole = interpolate(frame, [F0, F1], [1, 0], cl);
  const sweep = interpolate(frame, [F0, F1], [0, 720], cl);
  const inv = interpolate(frame, [T.invent - T.paint, T.invent - T.paint + 12], [0, 1], cl);
  const brush = interpolate(frame, [F0 - 10, F1], [0, Math.PI * 4], cl);
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
      {frame >= F0 && frame < F1 + 4 && (
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
      {/* "erfundener" Bereich */}
      <div
        style={{
          position: "absolute",
          left: 235,
          top: 235,
          width: 330,
          height: 330,
          borderRadius: "50%",
          border: `10px dashed ${C.red}`,
          opacity: inv,
          scale: String(1 + 0.04 * Math.sin(frame / 5)),
        }}
      />
      {frame >= F0 - 10 && frame < F1 + 6 && (
        <div style={{ position: "absolute", left: 340 + Math.cos(brush) * 110, top: 300 + Math.sin(brush) * 110 }}>
          <Emoji e="🖌️" size={150} />
        </div>
      )}
      {inv > 0 && (
        <div style={{ position: "absolute", left: 520, top: 170, opacity: inv, scale: String(0.8 + 0.2 * Math.sin(frame / 6)) }}>
          <Emoji e="✨" size={130} />
        </div>
      )}
    </div>
  );
};

export const Explain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eyeOpacity = interpolate(frame, [0, 8, T.brain - 6, T.brain], [0, 1, 1, 0], cl);
  const zoom = interpolate(frame, [T.blind, T.blind + 25], [1, 2.4], { ...cl, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const darken = interpolate(frame, [T.blind + 10, T.blind + 30], [0, 0.55], cl);
  const brainIn = spring({ frame: frame - T.brain, fps, config: { damping: 10, stiffness: 170 } });
  const brainMove = spring({ frame: frame - T.paint, fps, config: { damping: 16, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #16233a 0%, #07080c 65%)" }} />
      <AbsoluteFill style={{ opacity: eyeOpacity, translate: "0px 120px" }}>
        <AbsoluteFill style={{ scale: String(zoom), transformOrigin: `${discX}px ${discY - 100}px` }}>
          <EyeSection frame={frame} />
          {frame >= T.noCells && (
            <div
              style={{
                position: "absolute",
                left: discX - 330,
                top: discY + 110,
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 60,
                color: C.red,
                textShadow: "0 4px 0 rgba(0,0,0,0.6)",
                opacity: interpolate(frame, [T.noCells, T.noCells + 12], [0, 1], cl) * (1 - darken / 0.55),
              }}
            >
              Blinder Fleck
            </div>
          )}
        </AbsoluteFill>
        <AbsoluteFill style={{ backgroundColor: "#000", opacity: darken }} />
      </AbsoluteFill>

      {frame >= T.paint && <FillIn frame={frame - T.paint} />}

      {frame >= T.brain && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              scale: String(brainIn * interpolate(brainMove, [0, 1], [1, 0.42])),
              translate: `${interpolate(brainMove, [0, 1], [0, 0])}px ${interpolate(brainMove, [0, 1], [-60, 520])}px`,
            }}
          >
            <Emoji e="🧠" size={520} />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
