import React from "react";
import { AbsoluteFill, Series, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Background } from "./components";
import { Captions } from "./Captions";
import {
  AtomsGridScene,
  EmptyAtomScene,
  HookScene,
  NotListScene,
  ZoomScene,
} from "./scenes/Part1";
import {
  ChargeScene,
  FingerTableScene,
  PauliScene,
  StadiumScene,
} from "./scenes/Part2";
import { CtaScene, FeelingScene, FloatScene, GapScene } from "./scenes/Part3";

/**
 * TikTok explainer: "Du hast noch nie etwas berührt".
 * Scene lengths follow the word timestamps of the voiceover (30 fps).
 */
export const TouchVideo: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Series>
      <Series.Sequence name="Hook" durationInFrames={105}>
        <HookScene />
      </Series.Sequence>
      <Series.Sequence name="Nicht Handy, Stuhl, Mensch" durationInFrames={122}>
        <NotListScene />
      </Series.Sequence>
      <Series.Sequence name="Zoom" durationInFrames={78}>
        <ZoomScene />
      </Series.Sequence>
      <Series.Sequence name="Atome" durationInFrames={58}>
        <AtomsGridScene />
      </Series.Sequence>
      <Series.Sequence name="Leeres Atom" durationInFrames={87}>
        <EmptyAtomScene />
      </Series.Sequence>
      <Series.Sequence name="Stadion" durationInFrames={216}>
        <StadiumScene />
      </Series.Sequence>
      <Series.Sequence name="Ladung" durationInFrames={134}>
        <ChargeScene />
      </Series.Sequence>
      <Series.Sequence name="Finger und Tisch" durationInFrames={278}>
        <FingerTableScene />
      </Series.Sequence>
      <Series.Sequence name="Pauli" durationInFrames={180}>
        <PauliScene />
      </Series.Sequence>
      <Series.Sequence name="Abstand" durationInFrames={158}>
        <GapScene />
      </Series.Sequence>
      <Series.Sequence name="Gefühl" durationInFrames={300}>
        <FeelingScene />
      </Series.Sequence>
      <Series.Sequence name="Schweben" durationInFrames={177}>
        <FloatScene />
      </Series.Sequence>
      <Series.Sequence name="Call to Action" durationInFrames={93}>
        <CtaScene />
      </Series.Sequence>
    </Series>
    <Captions hideAfterMs={63000} />
    <Audio src={staticFile("voiceover.mp3")} />
  </AbsoluteFill>
);
