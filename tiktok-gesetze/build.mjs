// Erzeugt index.html aus Szenendaten + Wort-Zeitstempeln des ElevenLabs-Voiceovers.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const words = JSON.parse(readFileSync("assets/words.json", "utf8")).map(([t, s, e]) => ({ t, s, e }));
const DURATION = 75.6;
const HAS_AUDIO = existsSync("assets/voiceover.mp3");

// start = Zeitpunkt von "Platz ..." im Voiceover, stamp = Wort, auf dem der Stempel einschlägt
const scenes = [
  { r: 10, start: 4.4,  flag: "🇨🇭", land: "Schweiz",     icon: "🐹", head: "Meerschweinchen nie allein halten", stamp: "PFLICHT: 2+",       stampAt: 9.64,  src: "Tierschutzverordnung (TSchV), Art. 13" },
  { r: 9,  start: 11.08, flag: "🇮🇹", land: "Venedig",     icon: "🕊️", head: "Tauben füttern verboten",           stamp: "BUSSGELD",          stampAt: 15.72, src: "Stadt Venedig, Fütterungsverbot seit 2008" },
  { r: 8,  start: 16.72, flag: "🇮🇸", land: "Island",      icon: "👶", head: "Babynamen brauchen Genehmigung",    stamp: "GENEHMIGT?",        stampAt: 21.76, src: "Personennamengesetz Nr. 45/1996, Namenskomitee" },
  { r: 7,  start: 22.52, flag: "🇯🇵", land: "Japan",       icon: "📏", head: "Der Staat misst deinen Bauch",      stamp: "GRENZWERT!",        stampAt: 26.76, src: "„Metabo-Gesetz“, Gesundheitschecks seit 2008" },
  { r: 6,  start: 29.28, flag: "🇸🇬", land: "Singapur",    icon: "🍬", head: "Kaugummi-Verkauf verboten",         stamp: "VERBOTEN",          stampAt: 34.64, src: "Importverordnung, Verbot seit 1992" },
  { r: 5,  start: 35.52, flag: "🇨🇳", land: "China",       icon: "🧘", head: "Wiedergeburt nur mit Genehmigung",  stamp: "ANTRAG NÖTIG",      stampAt: 39.76, src: "Staatliche Religionsbehörde, Anordnung Nr. 5 (2007)" },
  { r: 4,  start: 42.04, flag: "🇹🇭", land: "Thailand",    icon: "👑", head: "Kritik am König = Gefängnis",       stamp: "50 JAHRE HAFT",     stampAt: 49.44, src: "Strafgesetzbuch §112; Urteil Januar 2024" },
  { r: 3,  start: 50.48, flag: "🇧🇳", land: "Brunei",      icon: "⚖️", head: "Steinigung im Strafgesetz",          stamp: "IM GESETZ",         stampAt: 54.72, src: "Syariah Penal Code Order, voll in Kraft seit 2019" },
  { r: 2,  start: 55.88, flag: "🇦🇫", land: "Afghanistan", icon: "🤐", head: "Frauenstimmen öffentlich verboten",  stamp: "VERSTUMMT",         stampAt: 60.48, src: "Taliban-„Tugendgesetz“, August 2024" },
  { r: 1,  start: 61.72, flag: "🇰🇵", land: "Nordkorea",   icon: "📺", head: "Südkoreanische Serien = Tod",       stamp: "TODESSTRAFE",       stampAt: 66.96, src: "Gesetz gegen reaktionäres Denken, 2020" },
];
const OUTRO = 70.8;
scenes.forEach((s, i) => (s.end = i < scenes.length - 1 ? scenes[i + 1].start : OUTRO));

// Farbe eskaliert: 10 = cooles Türkis, 1 = tiefes Blutrot
const hue = (r) => Math.round(((r - 1) / 9) * 175);
const col = (r, l = 50, s = 85) => `hsl(${hue(r)} ${s}% ${l}%)`;

// Untertitel: Gruppen von max. 3 Wörtern, Umbruch nach Satzzeichen
const chunks = [];
let cur = [];
for (const w of words) {
  cur.push(w);
  if (cur.length === 3 || /[.,:?!]$/.test(w.t)) { chunks.push(cur); cur = []; }
}
if (cur.length) chunks.push(cur);
// Intro und Outro haben den Text bereits groß im Bild
const capChunks = chunks.filter((c) => c[0].s >= 4.4 && c[0].s < 70.8);
chunks.forEach((c, i) => {
  c.start = c[0].s - 0.04;
  c.end = i < chunks.length - 1 ? Math.min(chunks[i + 1][0].s - 0.04, c[c.length - 1].e + 0.6) : DURATION - 0.6;
});
const capColorAt = (t) => {
  const s = [...scenes].reverse().find((x) => t >= x.start);
  return s && t < OUTRO ? col(s.r, 62, 100) : "#ffe14d";
};

const f = (n) => Number(n.toFixed(3));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

let html = "";
let js = "";

// ---------- Intro ----------
html += `
      <section id="intro" class="scene clip" data-start="0" data-duration="${scenes[0].start}" data-track-index="1">
        <div class="bg" style="background: radial-gradient(120% 80% at 50% 35%, #2b2f6b 0%, #0d0e24 60%, #05050d 100%)"></div>
        <div class="globe">🌍</div>
        <div class="intro-top">10 GESETZE,</div>
        <div class="intro-mid">DIE ES <span class="hl">WIRKLICH</span> GIBT</div>
        <div class="intro-sub">…und sie werden immer <span class="krass">KRASSER</span></div>
      </section>`;
js += `
  tl.fromTo("#intro .globe", { scale: 0.75, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.8)" }, 0.05);
  tl.to("#intro .globe", { rotation: 360, duration: ${scenes[0].start}, ease: "none" }, 0.75);
  tl.fromTo("#intro .intro-top", { y: -40, opacity: 1, scale: 1.15 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "power4.out" }, 0.02);
  tl.fromTo("#intro .intro-mid", { scale: 2.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "power4.out" }, 0.95);
  tl.fromTo("#intro .hl", { color: "#ffffff" }, { color: "#ffe14d", duration: 0.2 }, 1.36);
  tl.fromTo("#intro .intro-sub", { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, 2.45);
  tl.fromTo("#intro .krass", { scale: 1 }, { scale: 1.25, duration: 0.25, ease: "back.out(3)" }, 3.6);
  tl.to("#intro .krass", { x: 6, duration: 0.04, repeat: 9, yoyo: true, ease: "none" }, 3.85);
`;

// ---------- Szenen ----------
for (const s of scenes) {
  const id = `s${s.r}`;
  const d = f(s.end - s.start);
  const bg = `radial-gradient(130% 90% at 50% 30%, ${col(s.r, 32 - (10 - s.r) * 1.2, 70)} 0%, ${col(s.r, 12, 60)} 55%, #050507 100%)`;
  html += `
      <section id="${id}" class="scene clip" data-start="${f(s.start)}" data-duration="${d}" data-track-index="1">
        <div class="bg" style="background: ${bg}"></div>
        <div class="ghost">${s.r}</div>
        <div class="rankwrap"><div class="platz">PLATZ</div><div class="rank" style="color:${col(s.r, 60, 100)}">${s.r}</div></div>
        <div class="country"><span class="flag">${s.flag}</span><span>${esc(s.land.toUpperCase())}</span></div>
        <div class="icon">${s.icon}</div>
        <div class="headline">${esc(s.head)}</div>
        <div class="stamp" style="border-color:${col(s.r, 58, 100)};color:${col(s.r, 62, 100)}">${esc(s.stamp)}</div>
        <div class="source">Quelle: ${esc(s.src)}</div>
        <div class="flash"></div>
      </section>`;
  const t0 = s.start;
  const rel = (t) => f(t0 + t);
  js += `
  // Platz ${s.r}
  tl.fromTo("#${id} .flash", { opacity: 0.85 }, { opacity: 0, duration: 0.35, ease: "power2.out" }, ${rel(0)});
  tl.fromTo("#${id} .rank", { scale: 3.2, opacity: 0, rotation: -12 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.45, ease: "back.out(1.6)" }, ${rel(0.05)});
  tl.fromTo("#${id} .platz", { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, ${rel(0.05)});
  tl.fromTo("#${id} .ghost", { scale: 1.4, opacity: 0 }, { scale: 1, opacity: 0.07, duration: 0.8, ease: "power2.out" }, ${rel(0)});
  tl.to("#${id} .ghost", { y: -120, duration: ${d}, ease: "none" }, ${rel(0)});
  tl.fromTo("#${id} .country", { x: -700 }, { x: 0, duration: 0.45, ease: "power4.out" }, ${rel(0.75)});
  tl.fromTo("#${id} .icon", { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.55, ease: "back.out(2.2)" }, ${rel(0.95)});
  tl.to("#${id} .icon", { y: -26, duration: 0.6, repeat: ${Math.max(1, Math.floor((d - 1.6) / 0.6))}, yoyo: true, ease: "sine.inOut" }, ${rel(1.5)});
  tl.fromTo("#${id} .headline", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, ${rel(1.2)});
  tl.fromTo("#${id} .source", { opacity: 0 }, { opacity: 0.8, duration: 0.4 }, ${rel(1.5)});
  tl.fromTo("#${id} .stamp", { scale: 3, opacity: 0, rotation: 0 }, { scale: 1, opacity: 1, rotation: -8, duration: 0.22, ease: "power4.in" }, ${f(s.stampAt - 0.18)});
  tl.to("#${id} .icon", { opacity: 0, scale: 0.4, duration: 0.15, ease: "power2.in" }, ${f(s.stampAt - 0.16)});
  tl.fromTo("#${id} .bg", { x: 0 }, { x: ${s.r <= 3 ? 22 : 10}, duration: 0.04, repeat: ${s.r <= 3 ? 9 : 5}, yoyo: true, ease: "none", immediateRender: false }, ${f(s.stampAt + 0.04)});
`;
  if (s.r === 4) {
    // 15 -> 50 Jahre Zähler im Stempel-Moment
    js += `  tl.fromTo("#s4 .headline", { color: "#ffffff" }, { color: "${col(4, 65, 100)}", duration: 0.2 }, 49.44);\n`;
  }
  if (s.r === 1) {
    js += `
  tl.fromTo("#s1 .rank", { textShadow: "0 0 0px #ff0000" }, { textShadow: "0 0 80px #ff2020", duration: 0.5, repeat: ${Math.floor((d - 1) / 0.5)}, yoyo: true, ease: "sine.inOut" }, 62.4);
  tl.fromTo("#s1 .redpulse", { opacity: 0 }, { opacity: 0.55, duration: 0.5, repeat: ${Math.floor((d - 1) / 0.5)}, yoyo: true, ease: "sine.inOut" }, 62.4);
  tl.to("#s1 .rankwrap", { x: 14, duration: 0.05, repeat: 11, yoyo: true, ease: "none" }, 62.4);
`;
  }
}
html = html.replace(/(<section id="s1"[\s\S]*?)<div class="flash"><\/div>/, '$1<div class="redpulse"></div><div class="flash"></div>');

// ---------- Outro ----------
html += `
      <section id="outro" class="scene clip" data-start="${OUTRO}" data-duration="${f(DURATION - OUTRO)}" data-track-index="1">
        <div class="bg" style="background: radial-gradient(120% 80% at 50% 40%, #3a0a0a 0%, #120404 60%, #000 100%)"></div>
        <div class="outro-q">WELCHES SCHOCKT<br/>DICH AM MEISTEN?</div>
        <div class="outro-arrow">👇</div>
        <div class="outro-c">Schreib's in die Kommentare!</div>
        <div class="flash"></div>
      </section>`;
js += `
  tl.fromTo("#outro .flash", { opacity: 0.9 }, { opacity: 0, duration: 0.4 }, ${OUTRO});
  tl.fromTo("#outro .outro-q", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }, ${f(OUTRO + 0.05)});
  tl.fromTo("#outro .outro-arrow", { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "bounce.out" }, ${f(OUTRO + 2.1)});
  tl.to("#outro .outro-arrow", { y: 24, duration: 0.35, repeat: 5, yoyo: true, ease: "sine.inOut" }, ${f(OUTRO + 2.5)});
  tl.fromTo("#outro .outro-c", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.35 }, ${f(OUTRO + 2.15)});
`;

// ---------- Krass-Meter (dauerhaft während des Countdowns) ----------
const meterSegs = scenes.map((s, i) => `<i id="seg${i}" style="background:${col(s.r, 55, 100)}"></i>`).join("");
html += `
      <div id="meter" class="clip" data-start="${scenes[0].start}" data-duration="${f(OUTRO - scenes[0].start)}" data-track-index="2">
        <div class="meter-label">KRASS-METER</div>
        <div class="meter-bar">${meterSegs}</div>
      </div>`;
js += `  tl.fromTo("#meter", { y: -200 }, { y: 0, duration: 0.5, ease: "power3.out" }, ${scenes[0].start});\n`;
scenes.forEach((s, i) => {
  js += `  tl.fromTo("#seg${i}", { opacity: 0.12, scaleY: 0.5 }, { opacity: 1, scaleY: 1, duration: 0.3, ease: "back.out(3)" }, ${f(s.start + 0.1)});\n`;
});

// ---------- Untertitel (Karaoke-Stil) ----------
capChunks.forEach((c, i) => {
  const color = capColorAt(c[0].s);
  const spans = c.map((w, j) => `<span id="w${i}_${j}">${esc(w.t)}</span>`).join(" ");
  html += `
      <div id="cap${i}" class="cap clip" data-start="${f(c.start)}" data-duration="${f(c.end - c.start)}" data-track-index="3">${spans}</div>`;
  js += `  tl.fromTo("#cap${i}", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.12, ease: "back.out(2)" }, ${f(c.start)});\n`;
  c.forEach((w, j) => {
    js += `  tl.fromTo("#w${i}_${j}", { color: "#ffffff", scale: 1 }, { color: "${color}", scale: 1.06, duration: 0.08, immediateRender: false }, ${f(w.s)});\n`;
  });
});

// ---------- Audio ----------
const audio = HAS_AUDIO
  ? `\n      <audio id="vo" src="assets/voiceover.mp3" data-start="0" data-duration="${DURATION}" data-volume="1" data-track-index="0"></audio>`
  : "";

const page = `<!doctype html>
<html lang="de" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="assets/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Inter Display"; src: url("assets/fonts/InterDisplay-Medium.otf"); font-weight: 500; }
      @font-face { font-family: "Inter Display"; src: url("assets/fonts/InterDisplay-ExtraBold.otf"); font-weight: 800; }
      @font-face { font-family: "Inter Display"; src: url("assets/fonts/InterDisplay-Black.otf"); font-weight: 900; }
      @font-face { font-family: "Noto Color Emoji"; src: url("assets/fonts/NotoColorEmoji.ttf"); }
      :root { --ink: #ffffff; --font: "Inter Display", sans-serif; --emoji: "Noto Color Emoji"; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: #000; }
      #root { position: relative; width: 1080px; height: 1920px; overflow: hidden; font-family: var(--font); color: var(--ink); }
      .clip { position: absolute; inset: 0; }
      .scene { overflow: hidden; }
      .bg { position: absolute; inset: -40px; }
      .flash, .redpulse { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; }
      .redpulse { background: radial-gradient(closest-side, rgba(255,0,0,0) 40%, rgba(255,0,0,0.9) 100%); }
      .ghost { position: absolute; left: 0; right: 0; top: 560px; text-align: center; font-weight: 900; font-size: 1300px; line-height: 1; letter-spacing: -0.06em; color: #fff; opacity: 0.07; }

      .rankwrap { position: absolute; top: 250px; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; }
      .platz { font-weight: 800; font-size: 64px; letter-spacing: 0.35em; padding-left: 0.35em; opacity: 0.9; }
      .rank { font-weight: 900; font-size: 300px; line-height: 0.95; letter-spacing: -0.05em; text-shadow: 0 12px 0 rgba(0,0,0,0.45); }
      .country { position: absolute; top: 640px; left: 140px; right: 140px; display: flex; justify-content: center; align-items: center; gap: 22px;
        font-weight: 900; font-size: 64px; letter-spacing: 0.04em; }
      .country span:last-child { background: rgba(0,0,0,0.45); padding: 10px 30px; border-radius: 18px; }
      .flag { font-family: var(--emoji); font-size: 84px; }
      .icon { position: absolute; top: 760px; left: 0; right: 0; text-align: center; font-family: var(--emoji); font-size: 270px; line-height: 1.2; filter: drop-shadow(0 18px 24px rgba(0,0,0,0.5)); }
      .headline { position: absolute; top: 1105px; left: 120px; right: 120px; text-align: center; font-weight: 900; font-size: 66px; line-height: 1.08; text-transform: uppercase; text-shadow: 0 6px 18px rgba(0,0,0,0.6); }
      .stamp { position: absolute; top: 805px; left: 0; right: 0; margin: 0 auto; width: max-content; padding: 10px 34px; border: 10px solid; border-radius: 22px;
        font-weight: 900; font-size: 92px; letter-spacing: 0.02em; background: rgba(0,0,0,0.72); opacity: 0; }
      .source { position: absolute; top: 1500px; left: 120px; right: 160px; text-align: center; font-weight: 500; font-size: 28px; opacity: 0; color: #e8e8e8; }

      .cap { inset: auto; left: 90px; right: 150px; top: 1290px; height: 180px; display: flex; flex-wrap: wrap; justify-content: center; align-content: center; gap: 0 30px;
        font-weight: 900; font-size: 78px; line-height: 1.05; text-transform: uppercase;
        -webkit-text-stroke: 4px #000; paint-order: stroke fill; text-shadow: 0 8px 0 rgba(0,0,0,0.75); }
      .cap span { display: inline-block; }

      #meter { inset: auto; top: 120px; left: 140px; right: 140px; height: 90px; }
      .meter-label { font-weight: 900; font-size: 30px; letter-spacing: 0.3em; text-align: center; margin-bottom: 12px; text-shadow: 0 3px 8px rgba(0,0,0,0.7); }
      .meter-bar { display: flex; gap: 8px; height: 30px; padding: 6px; background: rgba(0,0,0,0.55); border-radius: 14px; }
      .meter-bar i { flex: 1; border-radius: 6px; opacity: 0.12; }

      .globe { position: absolute; top: 330px; left: 0; right: 0; text-align: center; font-family: var(--emoji); font-size: 300px; }
      .intro-top, .intro-mid { position: absolute; left: 60px; right: 60px; text-align: center; font-weight: 900; letter-spacing: -0.02em; }
      .intro-top { top: 760px; font-size: 130px; }
      .intro-mid { top: 905px; font-size: 80px; white-space: nowrap; }
      .hl { color: #ffe14d; }
      .intro-sub { position: absolute; top: 1060px; left: 60px; right: 60px; text-align: center; font-weight: 800; font-size: 60px; }
      .krass { display: inline-block; color: #ff3b3b; font-weight: 900; }

      .outro-q { position: absolute; top: 470px; left: 40px; right: 40px; text-align: center; font-weight: 900; font-size: 88px; white-space: nowrap; line-height: 1.05; }
      .outro-arrow { position: absolute; top: 760px; line-height: 1; left: 0; right: 0; text-align: center; font-family: var(--emoji); font-size: 220px; }
      .outro-c { position: absolute; top: 1080px; left: 80px; right: 80px; text-align: center; font-weight: 800; font-size: 58px; color: #ffe14d; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${DURATION}" data-width="1080" data-height="1920">${html}${audio}
    </div>
    <script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });
${js}
  window.__timelines["main"] = tl;
  tl.seek(0);
    </script>
  </body>
</html>
`;
writeFileSync("index.html", page);
console.log(`index.html geschrieben: ${scenes.length} Szenen, ${capChunks.length} Untertitel, Audio: ${HAS_AUDIO ? "ja" : "NEIN (assets/voiceover.mp3 fehlt)"}`);
