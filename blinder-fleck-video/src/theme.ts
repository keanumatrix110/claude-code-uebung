export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const C = {
  bg: "#07080c",
  text: "#ffffff",
  yellow: "#FFE14D",
  red: "#FF3B5C",
  cyan: "#4DE1FF",
  dim: "rgba(255,255,255,0.55)",
};

export const FONT = "Inter, 'Noto Color Emoji', sans-serif";

// Szenenlängen in Frames (30 fps), exakt auf audio/voiceover_timed.wav abgestimmt.
export const SCENES = {
  hook: 132, // 0,0 bis 4,4 s
  proof: 63, // 4,4 bis 6,5 s
  test: 483, // 6,5 bis 22,6 s
  explain: 477, // 22,6 bis 38,5 s
  octopus: 177, // 38,5 bis 44,4 s
  cta: 150, // 44,4 bis 49,4 s
};

// Sekunden in Frames
export const sec = (s: number) => Math.round(s * FPS);

export const TOTAL = Object.values(SCENES).reduce((a, b) => a + b, 0);
