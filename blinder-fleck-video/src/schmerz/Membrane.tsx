import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, sec } from "../theme";
import { Emoji } from "../Emoji";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// VO relativ zu 23,7 s:
// "Winzige Tore in der Zelle gehen auf," 0,13 | "Salz strömt rein," 2,48 | "und die Spannung kippt." 3,83
// "In einer Tausendstelsekunde." 5,15 | "Tor für Tor, den ganzen Nerv entlang." 7,07
const T = { gates: sec(0.13), inflow: sec(2.48), flip: sec(3.83), ms: sec(5.15), wave: sec(7.07) };
// Die Welle läuft alle 60 Frames erneut durch
const loopF = (frame: number) => T.wave + ((frame - T.wave) % 60);

const MY = 980; // Mitte der Membran
const GATES = Array.from({ length: 7 }, (_, i) => 120 + i * 140);
const CENTER = 3;

// Öffnungsgrad eines Tores (0 zu, 1 offen)
const gateOpen = (i: number, frame: number) => {
  if (frame < T.wave) {
    if (i !== CENTER) return 0;
    return interpolate(frame, [T.gates + 10, T.gates + 25, T.flip + 20, T.flip + 35], [0, 1, 1, 0], cl);
  }
  const start = T.wave + i * 7;
  return interpolate(loopF(frame), [start, start + 6, start + 16, start + 24], [0, 1, 1, 0], cl);
};

const Gate: React.FC<{ x: number; open: number; glow: number }> = ({ x, open, glow }) => (
  <>
    <div style={{ position: "absolute", left: x - 50 - open * 22, top: MY - 110, width: 44, height: 220, borderRadius: 22, backgroundColor: "#7c5cff", boxShadow: `0 0 ${30 * glow}px ${C.yellow}` }} />
    <div style={{ position: "absolute", left: x + 6 + open * 22, top: MY - 110, width: 44, height: 220, borderRadius: 22, backgroundColor: "#7c5cff", boxShadow: `0 0 ${30 * glow}px ${C.yellow}` }} />
  </>
);

const Ion: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x - 26,
      top: y - 26,
      width: 52,
      height: 52,
      borderRadius: "50%",
      backgroundColor: C.yellow,
      color: C.bg,
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: 40,
      lineHeight: "52px",
      textAlign: "center",
      scale: String(s),
      boxShadow: "0 0 18px rgba(255,225,77,0.6)",
    }}
  >
    +
  </div>
);

export const SMembrane: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoomIn = spring({ frame, fps, config: { damping: 200 } });
  // Spannung: -70 mV vor dem Kippen, dann +30 mV, danach zurück
  const mv = frame < T.wave
    ? interpolate(frame, [T.flip, T.flip + 8, T.flip + 40, T.flip + 60], [-70, 30, 30, -70], cl)
    : -70 + 100 * Math.max(0, Math.sin(((loopF(frame) - T.wave) / 49) * Math.PI));
  const needle = interpolate(mv, [-90, 50], [-80, 80]);
  const gauge = spring({ frame: frame - T.flip + 10, fps, config: { damping: 12, stiffness: 160 } });
  const watch = spring({ frame: frame - T.ms, fps, config: { damping: 9, stiffness: 200 } });
  const watchOut = interpolate(frame, [T.wave - 8, T.wave], [1, 0], cl);
  const insideGlow = interpolate(mv, [-70, 30], [0, 1], cl);

  // Ionen draußen (oben) und drinnen (unten)
  const ions = Array.from({ length: 18 }, (_, i) => {
    const bx = 90 + random(`ix${i}`) * 900;
    const by = MY - 200 - random(`iy${i}`) * 230;
    const jx = Math.sin(frame / 10 + i) * 14;
    const jy = Math.cos(frame / 12 + i * 2) * 14;
    // Einströmen am mittleren Tor
    const inflowStart = T.inflow + (i % 9) * 4;
    const t = i < 9 ? interpolate(frame, [inflowStart, inflowStart + 22], [0, 1], cl) : 0;
    const gx = GATES[CENTER];
    let x = bx + jx;
    let y = by + jy;
    if (t > 0) {
      if (t < 0.5) {
        x = interpolate(t, [0, 0.5], [bx, gx]);
        y = interpolate(t, [0, 0.5], [by, MY - 60]);
      } else {
        x = gx + (bx - gx) * (t - 0.5) * 0.8;
        y = interpolate(t, [0.5, 1], [MY - 60, MY + 260 + (i % 3) * 90]);
      }
    }
    return { x, y };
  });

  // Welle: an jedem Tor ein kleiner Ionen-Stoß
  const waveIons = frame >= T.wave
    ? GATES.map((gx, gi) => {
        const st = T.wave + gi * 7 + 3;
        const t = interpolate(loopF(frame), [st, st + 16], [0, 1], cl);
        return t > 0 && t < 1 ? <Ion key={gi} x={gx} y={interpolate(t, [0, 1], [MY - 200, MY + 200])} s={0.8} /> : null;
      })
    : null;
  const front = frame >= T.wave ? interpolate(loopF(frame), [T.wave, T.wave + 7 * 7], [GATES[0], GATES[6]], cl) : -999;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0d16" }}>
      <AbsoluteFill style={{ scale: String(interpolate(zoomIn, [0, 1], [1.6, 1])) }}>
        {/* draußen / drinnen */}
        <div style={{ position: "absolute", left: 0, top: MY + 60, width: 1080, height: 900, background: `rgba(255,59,92,${0.05 + 0.3 * insideGlow})` }} />
        {/* Membran: zwei Reihen Lipid-Köpfe */}
        {Array.from({ length: 28 }, (_, i) => (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: i * 40, top: MY - 80, width: 34, height: 34, borderRadius: "50%", backgroundColor: "#e9b07a" }} />
            <div style={{ position: "absolute", left: i * 40 + 14, top: MY - 46, width: 6, height: 40, backgroundColor: "#a8754a" }} />
            <div style={{ position: "absolute", left: i * 40 + 14, top: MY + 6, width: 6, height: 40, backgroundColor: "#a8754a" }} />
            <div style={{ position: "absolute", left: i * 40, top: MY + 46, width: 34, height: 34, borderRadius: "50%", backgroundColor: "#e9b07a" }} />
          </React.Fragment>
        ))}
        {GATES.map((gx, i) => {
          const o = gateOpen(i, frame);
          return <Gate key={i} x={gx} open={o} glow={o} />;
        })}
        {frame >= T.wave && (
          <div style={{ position: "absolute", left: front - 90, top: MY - 160, width: 180, height: 320, borderRadius: 90, background: "radial-gradient(circle, rgba(255,225,77,0.55), rgba(255,225,77,0) 70%)" }} />
        )}
        {ions.map((p, i) => <Ion key={i} x={p.x} y={p.y} />)}
        {waveIons}
      </AbsoluteFill>

      {/* Spannungsanzeige */}
      {frame >= T.flip - 10 && (
        <div style={{ position: "absolute", left: 540 - 220, top: 170, scale: String(gauge), opacity: frame < T.ms || frame >= T.wave ? 1 : 0 }}>
          <svg width={440} height={260} viewBox="-120 -110 240 140">
            <path d="M -100 0 A 100 100 0 0 1 100 0" stroke="#333" strokeWidth={22} fill="none" />
            <path d="M -100 0 A 100 100 0 0 1 0 -100" stroke={C.cyan} strokeWidth={22} fill="none" />
            <path d="M 0 -100 A 100 100 0 0 1 100 0" stroke={C.red} strokeWidth={22} fill="none" />
            <line x1={0} y1={0} x2={0} y2={-90} stroke="#fff" strokeWidth={8} strokeLinecap="round" transform={`rotate(${needle})`} />
            <circle r={12} fill="#fff" />
          </svg>
          <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 70, color: mv > 0 ? C.red : C.cyan, marginTop: -10 }}>
            {mv > 0 ? "+" : ""}{Math.round(mv)} mV
          </div>
        </div>
      )}

      {/* Tausendstelsekunde */}
      {frame >= T.ms && frame < T.wave && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", translate: "0px -640px", opacity: watchOut }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, scale: String(watch) }}>
            <Emoji e="⏱️" size={170} />
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 150, color: C.yellow, textShadow: "0 6px 0 rgba(0,0,0,0.5)" }}>1 ms</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
