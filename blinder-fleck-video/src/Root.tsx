import React from "react";
import { Composition, Folder } from "remotion";
import { BlinderFleck } from "./BlinderFleck";
import { FPS, H, SCENES, TOTAL, W } from "./theme";
import { Hook } from "./scenes/Hook";
import { Proof } from "./scenes/Proof";
import { Test } from "./scenes/Test";
import { Explain } from "./scenes/Explain";
import { Octopus } from "./scenes/Octopus";
import { Cta } from "./scenes/Cta";

const scenes = [
  ["Hook", Hook, SCENES.hook],
  ["Beweis", Proof, SCENES.proof],
  ["Test", Test, SCENES.test],
  ["Erklaerung", Explain, SCENES.explain],
  ["Oktopus", Octopus, SCENES.octopus],
  ["CTA", Cta, SCENES.cta],
] as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Szenen">
      {scenes.map(([id, Comp, d]) => (
        <Composition key={id} id={id} component={Comp} durationInFrames={d} fps={FPS} width={W} height={H} />
      ))}
    </Folder>
    <Composition id="BlinderFleck" component={BlinderFleck} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
  </>
);
