import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";

// Montserrat (variable font, SIL Open Font License), bundled locally
export const fontFamily = "Montserrat";
loadFont({
  family: fontFamily,
  url: staticFile("fonts/Montserrat-latin.woff2"),
  weight: "100 900",
});

export const C = {
  bg: "#070B1E",
  bg2: "#18235A",
  cyan: "#3DF5FF",
  pink: "#FF3D7F",
  yellow: "#FFE14D",
  green: "#7CFF6B",
  white: "#F5F7FF",
  skin: "#F2B48C",
  skinDark: "#D98E66",
  wood: "#9A6440",
  woodDark: "#6E4128",
};

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = Math.ceil(66.19 * FPS);

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);

/** Seconds in the voiceover -> frame */
export const s = (sec: number) => Math.round(sec * FPS);
