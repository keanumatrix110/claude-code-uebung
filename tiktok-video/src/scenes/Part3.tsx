import React from "react";
import { Sequence, interpolate, random, useCurrentFrame } from "remotion";
import {
  Atom,
  Electron,
  Finger,
  Headline,
  Pill,
  Shell,
  Stage,
  usePop,
} from "../components";
import { C, clamp, fontFamily, inOut } from "../theme";

/* 41.94s  "Es bleibt also immer ein winziger Abstand. Kleiner als ein Millionstel Millimeter." */
export const GapScene: React.FC = () => {
  const f = useCurrentFrame();
  const gap = 120 + Math.sin(f / 5) * 14;
  const top = 500 - gap / 2;
  const bottom = 500 + gap / 2;
  const zoom = interpolate(f, [0, 158], [1, 1.2]);
  const ruler = usePop(38);
  const steps = [
    "0,1 mm",
    "0,01 mm",
    "0,001 mm",
    "0,0001 mm",
    "0,00001 mm",
    "< 0,000001 mm",
  ];
  const idx = Math.max(0, Math.min(steps.length - 1, Math.floor((f - 78) / 5)));

  return (
    <Shell>
      <Stage>
        <g transform={`translate(540 500) scale(${zoom}) translate(-540 -500)`}>
          <rect
            x={-100}
            y={-300}
            width={1280}
            height={top + 300}
            fill={C.skin}
          />
          <rect x={-100} y={bottom} width={1280} height={700} fill={C.wood} />
          <rect
            x={-100}
            y={top}
            width={1280}
            height={gap}
            fill={C.cyan}
            opacity={0.18 + Math.sin(f / 3) * 0.08}
            filter="url(#bigglow)"
          />
          {new Array(10).fill(0).map((_, i) => (
            <Electron key={`a${i}`} x={30 + i * 115} y={top} r={26} sign />
          ))}
          {new Array(10).fill(0).map((_, i) => (
            <Electron
              key={`b${i}`}
              x={85 + i * 115}
              y={bottom}
              r={26}
              color={C.pink}
              sign
            />
          ))}
          {/* measuring bracket */}
          <g
            opacity={ruler}
            stroke={C.yellow}
            strokeWidth={8}
            strokeLinecap="round"
            filter="url(#glow)"
          >
            <line x1={540} y1={top + 30} x2={540} y2={bottom - 30} />
            <line x1={500} y1={top + 30} x2={580} y2={top + 30} />
            <line x1={500} y1={bottom - 30} x2={580} y2={bottom - 30} />
          </g>
        </g>
      </Stage>
      <Pill x={540} y={330} delay={0} bg={C.bg} color={C.white} size={44}>
        Haut
      </Pill>
      <Pill x={540} y={1000} delay={0} bg={C.bg} color={C.white} size={44}>
        Tisch
      </Pill>
      {f >= 78 ? (
        <Pill x={540} y={1130} delay={78} size={72}>
          {steps[idx]}
        </Pill>
      ) : null}
    </Shell>
  );
};

/* 47.20s  "Was du als Berührung spürst, ist genau diese Abstoßung. Deine Nerven messen den Druck
            und dein Gehirn macht daraus ein Gefühl. Fest, glatt, warm." */
const Brain: React.FC<{ cx: number; cy: number; pulse: number }> = ({
  cx,
  cy,
  pulse,
}) => (
  <g
    transform={`translate(${cx} ${cy}) scale(${1 + pulse * 0.08})`}
    filter="url(#glow)"
  >
    {[
      [-70, -20, 80],
      [0, -55, 85],
      [70, -20, 80],
      [-45, 40, 70],
      [45, 40, 70],
    ].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="#FF7EB3" />
    ))}
    <g stroke="#C2457C" strokeWidth={8} fill="none" strokeLinecap="round">
      <path d="M 0 -120 Q -20 -40 0 20 Q 20 60 0 100" />
      <path d="M -110 -20 q 30 -30 60 0 t 50 0" />
      <path d="M 30 -60 q 30 -25 60 0" />
      <path d="M 20 40 q 30 25 70 0" />
      <path d="M -100 50 q 30 25 60 0" />
    </g>
  </g>
);

export const FeelingScene: React.FC = () => {
  const f = useCurrentFrame();
  const b = f - 110;
  const draw = interpolate(b, [0, 40], [1, 0], { ...clamp, easing: inOut });
  const brainIn = usePop(110 + 62);
  const pulse = b > 62 ? Math.max(0, Math.sin(b / 4)) : 0;
  const nerve = "M 270 820 C 270 560, 760 700, 760 440";

  return (
    <Shell>
      <Sequence durationInFrames={110} layout="none">
        <Headline top={330} delay={17} size={112}>
          Berührung
        </Headline>
        <Headline top={520} delay={60} size={170} color={C.yellow}>
          =
        </Headline>
        <Headline top={740} delay={80} size={112} color={C.pink}>
          Abstoßung
        </Headline>
      </Sequence>
      <Sequence from={110} layout="none">
        <Stage>
          <rect x={-50} y={900} width={1180} height={200} fill={C.wood} />
          <Finger x={270} tipY={880} w={150} />
          <circle
            cx={270}
            cy={890}
            r={30 + pulse * 12}
            fill={C.cyan}
            opacity={0.5}
            filter="url(#bigglow)"
          />
          <path
            d={nerve}
            stroke={C.yellow}
            strokeWidth={10}
            fill="none"
            opacity={0.35}
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={draw}
          />
          {b > 30 ? (
            <path
              d={nerve}
              stroke={C.yellow}
              strokeWidth={14}
              fill="none"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="0.05 0.2"
              strokeDashoffset={-b * 0.02}
              filter="url(#glow)"
            />
          ) : null}
          <g
            opacity={brainIn}
            transform={`translate(760 300) scale(${brainIn}) translate(-760 -300)`}
          >
            <Brain cx={760} cy={300} pulse={pulse} />
          </g>
        </Stage>
        <Pill x={330} y={1150} delay={37} bg={C.cyan} size={48}>
          Druck
        </Pill>
        <Pill x={420} y={330} delay={103} bg={C.white} size={64}>
          Fest
        </Pill>
        <Pill x={830} y={720} delay={141} bg={C.cyan} size={64}>
          Glatt
        </Pill>
        <Pill x={460} y={560} delay={163} bg={C.pink} color={C.white} size={64}>
          Warm
        </Pill>
      </Sequence>
    </Shell>
  );
};

/* 57.20s  "Streng genommen schwebst du also gerade. Über deinem Stuhl, über dem Boden, über allem." */
export const FloatScene: React.FC = () => {
  const f = useCurrentFrame();
  const h = 26 + Math.sin(f / 8) * 12;
  const floorGlow = interpolate(f, [118, 130], [0, 1], clamp);
  const allGlow = interpolate(f, [151, 165], [0, 1], clamp);
  const body = "#5B6CFF";

  return (
    <Shell>
      <Headline top={150} delay={15} size={100} color={C.cyan}>
        Du schwebst
      </Headline>
      <Stage>
        <g transform="translate(81 160) scale(0.85)">
          {/* floor */}
          <rect x={-200} y={880} width={1480} height={300} fill="#141A3E" />
          <rect
            x={-200}
            y={872}
            width={1480}
            height={8}
            fill={C.cyan}
            opacity={0.3 + floorGlow * 0.7}
            filter="url(#glow)"
          />
          {/* chair */}
          <g fill="#8A93B8">
            <rect x={380} y={600} width={330} height={36} rx={10} />
            <rect x={380} y={330} width={40} height={300} rx={12} />
            <rect x={395} y={630} width={26} height={250} />
            <rect x={670} y={630} width={26} height={250} />
          </g>
          {/* glowing gaps */}
          <rect
            x={400}
            y={600 - h}
            width={300}
            height={h}
            fill={C.cyan}
            opacity={0.55}
            filter="url(#glow)"
          />
          <rect
            x={630}
            y={872 - h}
            width={120}
            height={h}
            fill={C.cyan}
            opacity={0.35 + floorGlow * 0.4}
            filter="url(#glow)"
          />
          {/* person */}
          <g transform={`translate(0 ${-h})`}>
            <rect
              x={430}
              y={250}
              width={110}
              height={360}
              rx={50}
              fill={body}
            />
            <rect x={430} y={520} width={300} height={90} rx={45} fill={body} />
            <rect
              x={650}
              y={540}
              width={80}
              height={320}
              rx={36}
              fill="#4453D6"
            />
            <rect
              x={650}
              y={830}
              width={140}
              height={42}
              rx={20}
              fill="#2A2F55"
            />
            <rect
              x={470}
              y={330}
              width={200}
              height={60}
              rx={30}
              fill="#4453D6"
            />
            <circle cx={485} cy={170} r={72} fill={C.skin} />
          </g>
        </g>
        {/* everything floats: rising sparks */}
        <g opacity={allGlow}>
          {new Array(24).fill(0).map((_, i) => {
            const x = random(`fx${i}`) * 1080;
            const y =
              1000 -
              (((f - 151) * (3 + random(`fs${i}`) * 5) +
                random(`fy${i}`) * 600) %
                1000);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={4 + random(`fr${i}`) * 5}
                fill={i % 2 ? C.cyan : C.yellow}
                filter="url(#glow)"
              />
            );
          })}
        </g>
      </Stage>
    </Shell>
  );
};

/* 63.10s  "Folge für mehr Wissen, das deinen Kopf verdreht." */
export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const btn = usePop(30);
  return (
    <Shell>
      <Stage>
        <g transform={`rotate(${f * 4} 540 330)`}>
          <Atom
            cx={540}
            cy={330}
            size={260}
            nucleus={14}
            electronR={16}
            speed={0.18}
          />
        </g>
      </Stage>
      <Headline top={780} size={104}>
        Folge für mehr
      </Headline>
      <Headline top={1010} delay={12} size={58} color={C.yellow}>
        Wissen, das deinen Kopf verdreht
      </Headline>
      <div
        style={{
          position: "absolute",
          top: 1260,
          left: 540,
          translate: "-50% 0",
          scale: btn * (1 + Math.max(0, Math.sin(f / 4)) * 0.06),
          background: C.pink,
          color: C.white,
          fontFamily,
          fontWeight: 900,
          fontSize: 76,
          padding: "22px 70px",
          borderRadius: 999,
          boxShadow: `0 0 60px ${C.pink}aa, 0 10px 0 rgba(0,0,0,0.4)`,
          whiteSpace: "nowrap",
        }}
      >
        + FOLGEN
      </div>
    </Shell>
  );
};
