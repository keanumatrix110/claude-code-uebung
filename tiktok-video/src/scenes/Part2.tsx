import React from "react";
import { Sequence, interpolate, useCurrentFrame } from "remotion";
import { Electron, Finger, Pill, Shell, Stage, usePop } from "../components";
import { C, clamp, fontFamily, inOut, outExpo } from "../theme";

/* 15.00s  "Wäre der Atomkern eine Erbse in der Mitte eines Fußballstadions,
            dann wären die Elektronen irgendwo draußen auf den Rängen." */
export const StadiumScene: React.FC = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [50, 100], [14, 1], { ...clamp, easing: inOut });
  const electronsIn = interpolate(f, [137, 150], [0, 1], clamp);
  const cx = 540;
  const cy = 480;

  return (
    <Shell>
      <Stage>
        <g
          transform={`translate(${cx} ${cy}) scale(${z}) translate(${-cx} ${-cy})`}
        >
          {/* stands */}
          <ellipse cx={cx} cy={cy} rx={510} ry={360} fill="#222C66" />
          {[480, 450, 420, 390].map((rx, i) => (
            <ellipse
              key={rx}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={rx * 0.7}
              fill="none"
              stroke={i % 2 ? "#3A4C9E" : "#2E3D85"}
              strokeWidth={14}
              strokeDasharray="10 8"
            />
          ))}
          {/* pitch */}
          <rect
            x={cx - 310}
            y={cy - 205}
            width={620}
            height={410}
            rx={24}
            fill="#1C7A3A"
          />
          {new Array(8).fill(0).map((_, i) => (
            <rect
              key={i}
              x={cx - 310 + i * 77.5}
              y={cy - 205}
              width={38.75}
              height={410}
              fill="#228A44"
            />
          ))}
          <g stroke="white" strokeWidth={4} fill="none" opacity={0.85}>
            <rect x={cx - 290} y={cy - 185} width={580} height={370} />
            <line x1={cx} y1={cy - 185} x2={cx} y2={cy + 185} />
            <circle cx={cx} cy={cy} r={60} />
            <rect x={cx - 290} y={cy - 90} width={80} height={180} />
            <rect x={cx + 210} y={cy - 90} width={80} height={180} />
          </g>
          {/* the pea = nucleus */}
          <circle cx={cx} cy={cy} r={4} fill={C.green} filter="url(#glow)" />
        </g>
        {/* electrons running around on the stands */}
        <g opacity={electronsIn}>
          {new Array(7).fill(0).map((_, i) => {
            const t = f * (0.02 + i * 0.004) + i * 0.9;
            const rx = 420 + (i % 3) * 30;
            return (
              <Electron
                key={i}
                x={cx + Math.cos(t) * rx}
                y={cy + Math.sin(t) * rx * 0.7}
                r={11}
              />
            );
          })}
        </g>
      </Stage>
      <Sequence from={12} durationInFrames={78} layout="none">
        <Pill x={540} y={480} size={56}>
          Atomkern
        </Pill>
      </Sequence>
      <Sequence from={41} durationInFrames={49} layout="none">
        <Pill x={540} y={830} bg={C.green} size={56}>
          = Erbse
        </Pill>
      </Sequence>
      <Sequence from={95} layout="none">
        <Pill x={540} y={590} bg={C.green} size={34}>
          Erbse
        </Pill>
      </Sequence>
      <Sequence from={80} durationInFrames={57} layout="none">
        <Pill x={540} y={1110} size={64}>
          Fußballstadion
        </Pill>
      </Sequence>
      <Sequence from={137} layout="none">
        <Pill x={540} y={1110} bg={C.cyan} size={64}>
          Elektronen
        </Pill>
      </Sequence>
    </Shell>
  );
};

/* 22.20s  "Diese Elektronen sind negativ geladen. Und gleiche Ladungen stoßen sich ab." */
export const ChargeScene: React.FC = () => {
  const f = useCurrentFrame();
  const single = usePop(0);
  const split = f >= 80;
  const lx = interpolate(f, [80, 92, 106, 124], [540, 250, 425, 150], {
    ...clamp,
    easing: inOut,
  });
  const ring = interpolate(f, [106, 126], [0, 1], clamp);
  const shake = f > 106 && f < 120 ? Math.sin(f * 3) * 14 : 0;

  return (
    <Shell>
      <Stage style={{ translate: `${shake}px 0px` }}>
        {!split ? (
          <g
            transform={`translate(540 470) scale(${single}) translate(-540 -470)`}
          >
            <Electron x={540} y={470} r={140} sign />
          </g>
        ) : (
          <>
            <circle
              cx={540}
              cy={470}
              r={ring * 380}
              fill="none"
              stroke={C.yellow}
              strokeWidth={14}
              opacity={f > 106 ? 1 - ring : 0}
            />
            <Electron x={lx} y={470} r={100} sign />
            <Electron x={1080 - lx} y={470} r={100} sign />
            {f > 108 ? (
              <g
                stroke={C.yellow}
                strokeWidth={14}
                strokeLinecap="round"
                fill="none"
                filter="url(#glow)"
                opacity={interpolate(f, [108, 114], [0, 1], clamp)}
              >
                <path d="M 470 690 L 230 690 M 280 650 L 230 690 L 280 730" />
                <path d="M 610 690 L 850 690 M 800 650 L 850 690 L 800 730" />
              </g>
            ) : null}
          </>
        )}
      </Stage>
      <Sequence from={35} durationInFrames={45} layout="none">
        <Pill x={540} y={1110} bg={C.pink} color={C.white} size={64}>
          negativ −
        </Pill>
      </Sequence>
      <Sequence from={106} layout="none">
        <Pill x={540} y={1110} size={64}>
          − stößt − ab
        </Pill>
      </Sequence>
    </Shell>
  );
};

/* 26.66s  "Näherst du deinen Finger einer Tischplatte, drücken die Elektronen deiner Haut
            gegen die Elektronen des Tisches. Je näher du kommst, desto stärker der Widerstand." */
export const FingerTableScene: React.FC = () => {
  const f = useCurrentFrame();
  const approach1 = interpolate(f, [0, 47], [-120, 470], {
    ...clamp,
    easing: outExpo,
  });
  const approach2 = interpolate(f, [75, 188, 250], [0, 60, 230], {
    ...clamp,
    easing: inOut,
  });
  const tipY = approach1 + approach2;
  const close = interpolate(tipY, [470, 700], [0, 1], clamp);
  const electrons = usePop(75);
  const jitter = close > 0.6 ? Math.sin(f * 2.7) * close * 6 : 0;
  const tableY = 770;
  const meterH = 460;
  const fill = interpolate(electrons, [0, 1], [0, 0.12 + close * 0.88]);

  return (
    <Shell>
      <Stage>
        {/* table */}
        <rect x={-50} y={tableY} width={1180} height={400} fill={C.wood} />
        {[40, 110, 190].map((d) => (
          <path
            key={d}
            d={`M -50 ${tableY + d} Q 300 ${tableY + d - 20} 540 ${tableY + d} T 1130 ${tableY + d}`}
            stroke={C.woodDark}
            strokeWidth={6}
            fill="none"
            opacity={0.6}
          />
        ))}
        <g transform={`translate(${jitter} 0)`}>
          <Finger x={540} tipY={tipY} />
          {/* skin electrons */}
          <g opacity={electrons}>
            {[-2, -1, 0, 1, 2].map((i) => (
              <Electron
                key={i}
                x={540 + i * 32}
                y={tipY - 10 - i * i * 7}
                r={13}
                sign
              />
            ))}
          </g>
        </g>
        {/* table electrons */}
        <g opacity={electrons}>
          {new Array(11).fill(0).map((_, i) => (
            <Electron
              key={i}
              x={300 + i * 48}
              y={tableY + 6}
              r={13}
              color={C.pink}
              sign
            />
          ))}
        </g>
        {/* repulsion between both */}
        <g
          opacity={electrons * (0.3 + close * 0.7)}
          stroke={C.yellow}
          strokeWidth={4 + close * 8}
          strokeLinecap="round"
          filter="url(#glow)"
        >
          {[-60, 0, 60].map((dx) => (
            <path
              key={dx}
              d={`M ${540 + dx} ${tipY + 12} L ${540 + dx} ${tableY - 14}`}
              strokeDasharray="14 12"
              strokeDashoffset={-f * 4}
            />
          ))}
        </g>
        {/* resistance meter */}
        <g opacity={electrons}>
          <rect
            x={930}
            y={180}
            width={70}
            height={meterH}
            rx={35}
            fill="#151C44"
            stroke={C.white}
            strokeWidth={5}
          />
          <rect
            x={940}
            y={180 + 10 + (meterH - 20) * (1 - fill)}
            width={50}
            height={(meterH - 20) * fill}
            rx={25}
            fill={close > 0.7 ? C.pink : C.yellow}
            filter="url(#glow)"
          />
        </g>
      </Stage>
      <Sequence from={30} durationInFrames={45} layout="none">
        <Pill x={540} y={1120} size={60}>
          Finger → Tisch
        </Pill>
      </Sequence>
      <Sequence from={188} layout="none">
        <Pill x={830} y={290} bg={C.pink} color={C.white} size={44}>
          Widerstand
        </Pill>
      </Sequence>
    </Shell>
  );
};

/* 35.94s  "Dazu kommt ein Gesetz der Quantenphysik. Zwei Elektronen können nie denselben
            Zustand einnehmen." */
export const PauliScene: React.FC = () => {
  const f = useCurrentFrame();
  const badge = usePop(36);
  const glitch = f > 36 && f < 60 && f % 4 < 2 ? 8 : 0;
  const box = usePop(76);
  const e2x = interpolate(f, [96, 126, 142], [1250, 755, 930], {
    ...clamp,
    easing: inOut,
  });
  const hit = interpolate(f, [126, 150], [1, 0], clamp);

  return (
    <Shell>
      <div
        style={{
          position: "absolute",
          top: 240,
          width: "100%",
          textAlign: "center",
          fontFamily,
          fontWeight: 900,
          fontSize: 116,
          color: C.white,
          lineHeight: 1,
          textTransform: "uppercase",
          scale: badge,
          textShadow: `${glitch}px 0 0 ${C.pink}, ${-glitch}px 0 0 ${C.cyan}, 0 0 50px ${C.cyan}88`,
          translate: `${glitch / 2}px 0px`,
        }}
      >
        Quanten-
        <br />
        physik
      </div>
      <Stage>
        <g
          opacity={box}
          transform={`translate(540 640) scale(${box}) translate(-540 -640)`}
        >
          <rect
            x={430}
            y={530}
            width={220}
            height={220}
            rx={36}
            fill="#151C44"
            stroke={C.cyan}
            strokeWidth={8}
          />
          <Electron x={540} y={640} r={60} sign />
          <line
            x1={650}
            y1={520}
            x2={650}
            y2={760}
            stroke={C.pink}
            strokeWidth={16}
            strokeLinecap="round"
            opacity={hit}
            filter="url(#bigglow)"
          />
        </g>
        {f > 96 ? <Electron x={e2x} y={640} r={60} sign /> : null}
        {f > 126 ? (
          <g
            opacity={hit}
            transform={`translate(700 450) scale(${1 + (1 - hit) * 0.5})`}
            filter="url(#glow)"
          >
            <path
              d="M -40 -40 L 40 40 M 40 -40 L -40 40"
              stroke={C.pink}
              strokeWidth={20}
              strokeLinecap="round"
            />
          </g>
        ) : null}
      </Stage>
      <Sequence from={143} layout="none">
        <Pill x={540} y={1110} size={64}>
          Pauli-Prinzip
        </Pill>
      </Sequence>
    </Shell>
  );
};
