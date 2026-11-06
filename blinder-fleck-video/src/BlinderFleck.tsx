import React from "react";
import { Series } from "remotion";
import { SCENES } from "./theme";
import { Hook } from "./scenes/Hook";
import { Proof } from "./scenes/Proof";
import { Test } from "./scenes/Test";
import { Explain } from "./scenes/Explain";
import { Octopus } from "./scenes/Octopus";
import { Cta } from "./scenes/Cta";

export const BlinderFleck: React.FC = () => (
  <Series>
    <Series.Sequence name="Hook" durationInFrames={SCENES.hook}><Hook /></Series.Sequence>
    <Series.Sequence name="Beweis" durationInFrames={SCENES.proof}><Proof /></Series.Sequence>
    <Series.Sequence name="Test" durationInFrames={SCENES.test}><Test /></Series.Sequence>
    <Series.Sequence name="Erklaerung" durationInFrames={SCENES.explain}><Explain /></Series.Sequence>
    <Series.Sequence name="Oktopus" durationInFrames={SCENES.octopus}><Octopus /></Series.Sequence>
    <Series.Sequence name="CTA" durationInFrames={SCENES.cta}><Cta /></Series.Sequence>
  </Series>
);
