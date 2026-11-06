import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, sec } from "../theme";
import { Emoji } from "../Emoji";
import { Eye } from "./Eye";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// WICHTIG: Kreuz und Punkt bewegen sich NICHT, sonst funktioniert der Test nicht.
// Positionen liegen in der TikTok-Safe-Zone (rechts sind die Buttons, unten die Caption).
const Y = 900;
const CROSS_X = 190;
const DOT_X = 820;

// VO-Zeiten relativ zum Szenenstart (6,5 s)
const T = {
  closeEye: sec(0.1), // "Halt dir das linke Auge zu."
  lookCross: sec(1.9), // "Schau mit dem rechten Auge nur auf das Kreuz. Nur aufs Kreuz!"
  closer: sec(6.0), // "Und jetzt zieh dein Handy ganz langsam näher ran…"
  away: sec(10.2), // "…und wieder ein Stück weg."
  gone: sec(14.55), // "Der Punkt ist weg, oder?"
};

export const Test: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 6], [0, 1], cl);
  const progress = interpolate(frame, [0, T.gone], [0, 1], cl);

  // Phase 1 und 2: Augen-Symbol
  const eyesVisible = interpolate(frame, [T.closer - 8, T.closer], [1, 0], cl);
  const blink = interpolate(frame, [T.closeEye + 8, T.closeEye + 18], [0, 1], cl);
  const hand = spring({ frame: frame - T.closeEye - 6, fps, config: { damping: 12, stiffness: 160 } });
  const lookLeft = interpolate(frame, [T.lookCross, T.lookCross + 10], [0, -40], cl);

  // Ring + Pfeil am Kreuz
  const ringOn = frame >= T.lookCross && frame < T.closer;
  const ringPulse = 1 + 0.1 * Math.sin(frame / 4);
  const arrowBob = Math.sin(frame / 5) * 18;

  // Phase 3: Handy-Symbol, das näher kommt und wieder weggeht
  const phoneIn = spring({ frame: frame - T.closer + 6, fps, config: { damping: 14, stiffness: 140 } });
  const phoneOut = interpolate(frame, [T.gone - 10, T.gone], [1, 0], cl);
  let phoneScale = 1;
  if (frame < T.away) {
    phoneScale = interpolate(frame, [T.closer, T.away - sec(0.9)], [1, 1.9], { ...cl, easing: (t) => t * t * (3 - 2 * t) });
  } else if (frame < T.away + sec(1.5)) {
    phoneScale = interpolate(frame, [T.away, T.away + sec(1.5)], [1.9, 1.2], cl);
  } else {
    // in der Pause sanft weiter vor und zurück, als Erinnerung
    phoneScale = 1.2 + 0.35 * Math.sin((frame - T.away - sec(1.5)) / 14);
  }

  const eyes = spring({ frame: frame - T.gone, fps, config: { damping: 9, stiffness: 200 } });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fadeIn }}>
      {/* Augen-Symbol oben */}
      <AbsoluteFill style={{ top: 230, height: 360, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 40, opacity: eyesVisible }}>
        <div style={{ position: "relative" }}>
          <Eye size={330} blink={blink} />
          <div
            style={{
              position: "absolute",
              left: 40,
              top: -40,
              translate: `${(1 - hand) * -500}px 0px`,
              rotate: "-12deg",
            }}
          >
            <Emoji e="✋" size={250} />
          </div>
        </div>
        <Eye size={330} lookX={lookLeft} />
      </AbsoluteFill>

      {/* Handy-Symbol */}
      {frame >= T.closer - 6 && (
        <AbsoluteFill style={{ top: 160, height: 520, justifyContent: "center", alignItems: "center", opacity: phoneOut }}>
          <div style={{ scale: String(phoneIn * phoneScale) }}>
            <Emoji e="📱" size={200} />
          </div>
        </AbsoluteFill>
      )}

      {/* Kreuz */}
      <svg width={110} height={110} viewBox="0 0 110 110" style={{ position: "absolute", left: CROSS_X - 55, top: Y - 55 }}>
        <rect x={45} y={0} width={20} height={110} fill="#fff" />
        <rect x={0} y={45} width={110} height={20} fill="#fff" />
      </svg>
      {ringOn && (
        <>
          <div
            style={{
              position: "absolute",
              left: CROSS_X - 100,
              top: Y - 100,
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: `8px solid ${C.yellow}`,
              scale: String(ringPulse),
            }}
          />
          <div style={{ position: "absolute", left: CROSS_X - 55, top: Y - 290 + arrowBob }}>
            <svg width={110} height={130} viewBox="0 0 110 130">
              <rect x={40} y={0} width={30} height={70} fill={C.yellow} />
              <polygon points="0,65 110,65 55,130" fill={C.yellow} />
            </svg>
          </div>
        </>
      )}

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

      {/* "Punkt weg?" */}
      {frame >= T.gone && (
        <AbsoluteFill style={{ top: 1120, height: 300, justifyContent: "center", alignItems: "center" }}>
          <div style={{ scale: String(eyes), rotate: `${(1 - eyes) * 25}deg` }}>
            <Emoji e="👀" size={240} />
          </div>
        </AbsoluteFill>
      )}

      {/* Fortschrittsbalken */}
      <div style={{ position: "absolute", left: 120, top: 1500, width: 840, height: 12, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.15)" }}>
        <div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 6, backgroundColor: C.yellow }} />
      </div>
    </AbsoluteFill>
  );
};
