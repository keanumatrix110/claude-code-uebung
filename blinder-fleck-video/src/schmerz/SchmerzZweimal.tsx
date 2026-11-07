import React from "react";
import { Series } from "remotion";
import { SZ } from "./timing";
import { SHook } from "./Hook";
import { SWaves } from "./Waves";
import { SSpeeds } from "./Speeds";
import { SZoom } from "./Zoom";
import { SMembrane } from "./Membrane";
import { SMyelin } from "./Myelin";
import { SCta } from "./Cta";

export const SchmerzZweimal: React.FC = () => (
  <Series>
    <Series.Sequence name="Hook" durationInFrames={SZ.hook}><SHook /></Series.Sequence>
    <Series.Sequence name="Zwei Wellen" durationInFrames={SZ.waves}><SWaves /></Series.Sequence>
    <Series.Sequence name="Tempo" durationInFrames={SZ.speeds}><SSpeeds /></Series.Sequence>
    <Series.Sequence name="Zoom" durationInFrames={SZ.zoom}><SZoom /></Series.Sequence>
    <Series.Sequence name="Membran" durationInFrames={SZ.membrane}><SMembrane /></Series.Sequence>
    <Series.Sequence name="Myelin" durationInFrames={SZ.myelin}><SMyelin /></Series.Sequence>
    <Series.Sequence name="CTA" durationInFrames={SZ.cta}><SCta /></Series.Sequence>
  </Series>
);
