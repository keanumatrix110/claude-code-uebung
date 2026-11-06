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

// Szenenlängen in Frames (30 fps). Hier anpassen, wenn das Voiceover anders getaktet ist.
export const SCENES = {
  hook: 100,
  proof: 60,
  test: 360,
  explain: 300,
  octopus: 150,
  cta: 130,
};

export const TOTAL = Object.values(SCENES).reduce((a, b) => a + b, 0);
