// Szenenlängen in Frames (30 fps), abgestimmt auf public/voiceover_schmerz.mp3
export const SZ = {
  hook: 192, // 0,0 bis 6,4 s
  waves: 196, // 6,4 bis 12,93 s
  speeds: 173, // 12,93 bis 18,7 s
  zoom: 150, // 18,7 bis 23,7 s
  membrane: 285, // 23,7 bis 33,2 s
  myelin: 213, // 33,2 bis 40,3 s
  cta: 216, // 40,3 bis 47,5 s
};
export const SZ_TOTAL = Object.values(SZ).reduce((a, b) => a + b, 0);
