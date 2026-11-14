import { Composition } from "remotion";
import { TouchVideo } from "./TouchVideo";
import { DURATION, FPS, HEIGHT, WIDTH } from "./theme";

export const MyComposition = () => {
  return (
    <Composition
      id="NieBeruehrt"
      component={TouchVideo}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
