import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, clamp, fontFamily, outExpo } from "./theme";

/** Spring 0 -> 1 starting at `delay` frames. */
export const usePop = (delay = 0, damping = 11) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping, stiffness: 170, mass: 0.8 },
  });
};

/** Dark space background with drifting particles. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const dots = new Array(70).fill(0).map((_, i) => {
    const x = random(`x${i}`) * 1080;
    const y0 = random(`y${i}`) * 1920;
    const speed = 0.3 + random(`s${i}`) * 1.2;
    const y = (((y0 - frame * speed) % 1920) + 1920) % 1920;
    const r = 1 + random(`r${i}`) * 3;
    const o = 0.15 + random(`o${i}`) * 0.5;
    return { x, y, r, o, i };
  });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 38%, ${C.bg2} 0%, ${C.bg} 62%)`,
      }}
    >
      <svg width={1080} height={1920}>
        {dots.map((d) => (
          <circle
            key={d.i}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill={d.i % 5 === 0 ? C.cyan : C.white}
            opacity={d.o}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** Each scene enters with a zoom punch and a short flash. */
export const Shell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          scale: interpolate(frame, [0, 12], [1.18, 1], {
            ...clamp,
            easing: outExpo,
          }),
        }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundColor: C.white,
          opacity: interpolate(frame, [0, 5], [0.35, 0], clamp),
        }}
      />
    </AbsoluteFill>
  );
};

/** Visual area above the captions. SVG coordinates: 1080 x 1000. */
export const Stage: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <svg
    viewBox="0 0 1080 1000"
    width={1080}
    height={1000}
    style={{
      position: "absolute",
      top: 170,
      left: 0,
      overflow: "visible",
      ...style,
    }}
  >
    <defs>
      <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="8" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="bigglow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="22" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {children}
  </svg>
);

/** Big bold text block positioned in screen pixels. */
export const Headline: React.FC<{
  children: React.ReactNode;
  top: number;
  delay?: number;
  size?: number;
  color?: string;
  rotate?: number;
}> = ({
  children,
  top,
  delay = 0,
  size = 110,
  color = C.white,
  rotate = 0,
}) => {
  const p = usePop(delay);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 60,
        right: 60,
        textAlign: "center",
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.02,
        color,
        letterSpacing: -2,
        textTransform: "uppercase",
        textShadow: `0 0 40px ${color}66, 0 8px 0 rgba(0,0,0,0.45)`,
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        scale: interpolate(p, [0, 1], [0.4, 1]),
        rotate: `${rotate}deg`,
      }}
    >
      {children}
    </div>
  );
};

/** Pill label (e.g. "ATOMKERN"). Position is the pill's center in screen px. */
export const Pill: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  delay?: number;
  bg?: string;
  color?: string;
  size?: number;
}> = ({
  children,
  x,
  y,
  delay = 0,
  bg = C.yellow,
  color = C.bg,
  size = 52,
}) => {
  const p = usePop(delay);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
        scale: interpolate(p, [0, 1], [0, 1]),
        background: bg,
        color,
        fontFamily,
        fontWeight: 900,
        fontSize: size,
        padding: "10px 30px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        textTransform: "uppercase",
        boxShadow: `0 0 40px ${bg}88, 0 8px 0 rgba(0,0,0,0.35)`,
      }}
    >
      {children}
    </div>
  );
};

/** Glowing electron with a minus sign. */
export const Electron: React.FC<{
  x: number;
  y: number;
  r?: number;
  color?: string;
  sign?: boolean;
}> = ({ x, y, r = 16, color = C.cyan, sign = false }) => (
  <g filter="url(#glow)">
    <circle cx={x} cy={y} r={r} fill={color} />
    <circle
      cx={x - r * 0.3}
      cy={y - r * 0.3}
      r={r * 0.35}
      fill="white"
      opacity={0.6}
    />
    {sign ? (
      <rect
        x={x - r * 0.5}
        y={y - r * 0.11}
        width={r}
        height={r * 0.22}
        rx={r * 0.1}
        fill={C.bg}
      />
    ) : null}
  </g>
);

/** Atom: tiny nucleus with three tilted orbits. */
export const Atom: React.FC<{
  cx: number;
  cy: number;
  size: number;
  speed?: number;
  nucleus?: number;
  electronR?: number;
  orbitOpacity?: number;
}> = ({
  cx,
  cy,
  size,
  speed = 0.08,
  nucleus = 10,
  electronR = 12,
  orbitOpacity = 0.55,
}) => {
  const frame = useCurrentFrame();
  const rx = size;
  const ry = size * 0.36;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {[0, 60, 120].map((angle, i) => {
        const t = frame * speed + i * 2.1;
        return (
          <g key={angle} transform={`rotate(${angle})`}>
            <ellipse
              rx={rx}
              ry={ry}
              fill="none"
              stroke={C.cyan}
              strokeWidth={Math.max(1.5, size / 70)}
              opacity={orbitOpacity}
            />
            <Electron x={Math.cos(t) * rx} y={Math.sin(t) * ry} r={electronR} />
          </g>
        );
      })}
      <circle r={nucleus} fill={C.pink} filter="url(#glow)" />
    </g>
  );
};

/** Finger seen from the side, pointing down. tipY = lowest point. */
export const Finger: React.FC<{ x: number; tipY: number; w?: number }> = ({
  x,
  tipY,
  w = 170,
}) => (
  <g>
    <rect
      x={x - w / 2}
      y={tipY - 1400}
      width={w}
      height={1400}
      rx={w / 2}
      fill={C.skin}
    />
    <rect
      x={x + w / 2 - w * 0.28}
      y={tipY - 1400}
      width={w * 0.28}
      height={1400}
      rx={w * 0.14}
      fill={C.skinDark}
      opacity={0.45}
    />
    <rect
      x={x - w * 0.3}
      y={tipY - w * 0.95}
      width={w * 0.6}
      height={w * 0.7}
      rx={w * 0.25}
      fill="#FFD9C2"
      opacity={0.9}
    />
    {[0.45, 0.55].map((k) => (
      <path
        key={k}
        d={`M ${x - w * 0.3} ${tipY - w * 3 - k * 60} q ${w * 0.3} 18 ${w * 0.6} 0`}
        stroke={C.skinDark}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
    ))}
  </g>
);
