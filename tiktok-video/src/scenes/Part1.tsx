import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  Atom,
  Finger,
  Headline,
  Pill,
  Shell,
  Stage,
  usePop,
} from "../components";
import { C, clamp, fontFamily, inOut, outExpo } from "../theme";

/* 0.00s  "Du hast in deinem ganzen Leben noch nie etwas berührt." */
export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const tipY = interpolate(f, [0, 40], [-80, 318], {
    ...clamp,
    easing: outExpo,
  });
  const spark = interpolate(f, [32, 42], [0, 1], clamp);
  const count = Math.round(
    interpolate(f, [8, 72], [2847193, 0], { ...clamp, easing: outExpo }),
  );
  const zero = count === 0;
  const shake = zero
    ? Math.sin(f * 2.3) * interpolate(f, [72, 90], [14, 0], clamp)
    : 0;

  return (
    <Shell>
      <Stage>
        {/* phone lying on the table */}
        <rect
          x={250}
          y={380}
          width={580}
          height={70}
          rx={26}
          fill="#1B1F3B"
          stroke={C.cyan}
          strokeWidth={5}
        />
        <rect
          x={280}
          y={392}
          width={520}
          height={10}
          rx={5}
          fill={C.cyan}
          opacity={0.4}
        />
        <Finger x={540} tipY={tipY} />
        {/* the gap that never closes */}
        <g opacity={spark} filter="url(#bigglow)">
          <rect
            x={430}
            y={tipY + 10}
            width={220}
            height={380 - tipY - 14}
            rx={20}
            fill={C.cyan}
            opacity={0.35 + Math.sin(f / 2) * 0.15}
          />
          <path
            d={`M 440 ${tipY + 30} l 30 20 l 30 -20 l 30 20 l 30 -20 l 30 20 l 30 -20 l 30 20`}
            stroke={C.white}
            strokeWidth={5}
            fill="none"
          />
        </g>
      </Stage>
      <div
        style={{
          position: "absolute",
          top: 720,
          width: "100%",
          textAlign: "center",
          fontFamily,
          fontWeight: 900,
          fontSize: zero ? 300 : 170,
          color: zero ? C.pink : C.white,
          translate: `${shake}px 0px`,
          textShadow: `0 0 60px ${zero ? C.pink : C.cyan}88`,
          lineHeight: 1,
        }}
      >
        {count.toLocaleString("de-DE")}
      </div>
      <Headline top={1050} delay={20} size={70} color={C.yellow}>
        echte Berührungen
      </Headline>
    </Shell>
  );
};

/* 3.50s  "Nicht dein Handy, nicht deinen Stuhl, nicht mal einen anderen Menschen." */
const Card: React.FC<{
  cx: number;
  delay: number;
  children: React.ReactNode;
}> = ({ cx, delay, children }) => {
  const p = usePop(delay);
  const x = usePop(delay + 12, 9);
  return (
    <g transform={`translate(${cx} 450) scale(${p})`}>
      <rect
        x={-140}
        y={-175}
        width={280}
        height={350}
        rx={36}
        fill="#151C44"
        stroke={C.cyan}
        strokeWidth={5}
      />
      {children}
      <g
        transform={`scale(${interpolate(x, [0, 1], [2.2, 1])}) rotate(${interpolate(x, [0, 1], [-30, 0])})`}
        opacity={interpolate(x, [0, 0.2], [0, 1], clamp)}
        filter="url(#glow)"
      >
        <path
          d="M -110 -110 L 110 110 M 110 -110 L -110 110"
          stroke={C.pink}
          strokeWidth={30}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
};

export const NotListScene: React.FC = () => (
  <Shell>
    <Stage>
      <Card cx={200} delay={13}>
        <rect
          x={-55}
          y={-100}
          width={110}
          height={200}
          rx={20}
          fill="none"
          stroke={C.white}
          strokeWidth={10}
        />
        <rect
          x={-38}
          y={-78}
          width={76}
          height={140}
          rx={6}
          fill={C.cyan}
          opacity={0.6}
        />
        <circle cx={0} cy={80} r={7} fill={C.white} />
      </Card>
      <Card cx={540} delay={46}>
        <path
          d="M -55 -110 L -55 20 L 60 20 M -55 20 L -55 110 M 55 20 L 55 110 M -60 -10 L 60 -10"
          stroke={C.white}
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Card>
      <Card cx={880} delay={95}>
        <circle
          cx={0}
          cy={-60}
          r={42}
          fill="none"
          stroke={C.white}
          strokeWidth={12}
        />
        <path
          d="M -80 100 Q -80 0 0 0 Q 80 0 80 100"
          stroke={C.white}
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
        />
      </Card>
    </Stage>
    <Headline top={900} delay={0} size={92} color={C.white}>
      Nichts.
    </Headline>
  </Shell>
);

/* 7.56s  "Klingt verrückt? Dann schau genau hin." */
export const ZoomScene: React.FC = () => {
  const f = useCurrentFrame();
  const z = Math.max(0, f - 35);
  const qScale = interpolate(f, [35, 60], [1, 6], { ...clamp, easing: inOut });
  const qOpacity = interpolate(f, [35, 58], [1, 0], clamp);
  const steps = ["×10", "×1.000", "×100.000", "×10.000.000"];
  const step = steps[Math.min(steps.length - 1, Math.floor(z / 9))];

  return (
    <Shell>
      <Stage>
        {f > 35
          ? new Array(9).fill(0).map((_, i) => {
              const r = (z * 22 + i * 90) % 800;
              return (
                <circle
                  key={i}
                  cx={540}
                  cy={480}
                  r={r}
                  fill="none"
                  stroke={i % 2 ? C.cyan : C.pink}
                  strokeWidth={4 + r / 40}
                  opacity={interpolate(r, [0, 100, 800], [0, 0.9, 0])}
                />
              );
            })
          : null}
      </Stage>
      <div
        style={{
          position: "absolute",
          top: 260,
          width: "100%",
          textAlign: "center",
          fontFamily,
          fontWeight: 900,
          fontSize: 420,
          color: C.yellow,
          lineHeight: 1,
          rotate: `${Math.sin(f / 3) * 8}deg`,
          scale: qScale,
          opacity: qOpacity,
          textShadow: `0 0 80px ${C.yellow}88`,
        }}
      >
        ?!
      </div>
      {f > 35 ? (
        <Pill x={540} y={650} delay={35} bg={C.cyan} size={90}>
          {step}
        </Pill>
      ) : null}
    </Shell>
  );
};

/* 10.18s  "Alles besteht aus Atomen." */
export const AtomsGridScene: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 58], [0.85, 1.35]);
  const atoms: { x: number; y: number }[] = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 5; col++) {
      atoms.push({ x: 60 + col * 240 + (row % 2) * 120, y: 20 + row * 200 });
    }
  }
  return (
    <Shell>
      <Stage>
        <g transform={`translate(540 500) scale(${zoom}) translate(-540 -500)`}>
          {atoms.map((a, i) => (
            <Atom
              key={i}
              cx={a.x}
              cy={a.y}
              size={80}
              nucleus={7}
              electronR={6}
              speed={0.1 + (i % 3) * 0.02}
              orbitOpacity={0.4}
            />
          ))}
        </g>
      </Stage>
      <Pill x={540} y={1130} delay={30} size={80}>
        Atome
      </Pill>
    </Shell>
  );
};

/* 12.10s  "Und ein Atom ist fast vollständig leer." */
export const EmptyAtomScene: React.FC = () => {
  const p = usePop(0, 14);
  return (
    <Shell>
      <Stage>
        <g
          transform={`translate(540 470) scale(${interpolate(p, [0, 1], [0.3, 1])}) translate(-540 -470)`}
        >
          <Atom
            cx={540}
            cy={470}
            size={400}
            nucleus={5}
            electronR={18}
            speed={0.07}
          />
        </g>
      </Stage>
      <Pill x={700} y={570} delay={10} bg={C.pink} color={C.white} size={36}>
        Kern
      </Pill>
      <Headline top={930} delay={67} size={130} color={C.yellow}>
        99,9999 %
      </Headline>
      <Headline top={1070} delay={72} size={80}>
        leer
      </Headline>
    </Shell>
  );
};
