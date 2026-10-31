const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa6");
const fs = require("fs");
const { applyTheme } = require(process.env.SKILL + "/scripts/apply_theme.js");

const CLIPS = "/tmp/hf/clips";
const THEME = {
  name: "Audi Dark",
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  colors: {
    dk1: "0A0A0B", lt1: "FFFFFF", dk2: "1C1D21", lt2: "C9CCD1",
    accent1: "F50537", accent2: "8A8F98", accent3: "2A2C31",
    accent4: "E6E8EC", accent5: "5A5F68", accent6: "B0002A",
    hlink: "F50537", folHlink: "C9CCD1",
  },
};

async function icon(Comp, hex) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + hex, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
const b64 = (p) => "image/png;base64," + fs.readFileSync(p).toString("base64");

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625
  pres.title = "AUDI: Geschichte, Technik, Zukunft";
  pres.author = "Präsentation";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  // ---------- Layouts ----------
  pres.defineSlideMaster({
    title: "DARK_TITLE_ONLY",
    background: { path: "/tmp/deck/bg.png" },
    objects: [
      { placeholder: { options: { name: "kicker", type: "body", x: 0.6, y: 0.38, w: 8.8, h: 0.3, fontSize: 10, color: C.background2, charSpacing: 4, bold: false, margin: 0, valign: "middle" }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.66, w: 8.8, h: 0.7, fontSize: 32, bold: true, color: C.background1, margin: 0, valign: "middle", align: "left" }, text: "" } },
      { text: { text: "AUDI  ·  Vorsprung durch Technik", options: { x: 0.6, y: 5.2, w: 5, h: 0.25, fontSize: 9, color: C.accent2, margin: 0, isTextBox: true } } },
    ],
    slideNumber: { x: 8.9, y: 5.2, w: 0.5, h: 0.25, fontSize: 9, color: C.accent2, align: "right", margin: 0 },
  });
  pres.defineSlideMaster({ title: "VIDEO", background: { color: "0A0A0B" }, objects: [] });

  const I = {
    flag: await icon(fa.FaFlagCheckered, "F50537"),
    user: await icon(fa.FaUserTie, "F50537"),
    quote: await icon(fa.FaQuoteLeft, "F50537"),
    car: await icon(fa.FaCarSide, "F50537"),
    gears: await icon(fa.FaGears, "F50537"),
    trophy: await icon(fa.FaTrophy, "F50537"),
    road: await icon(fa.FaRoad, "F50537"),
    bolt: await icon(fa.FaBolt, "F50537"),
    plug: await icon(fa.FaChargingStation, "F50537"),
    layers: await icon(fa.FaLayerGroup, "F50537"),
    globe: await icon(fa.FaEarthAsia, "F50537"),
    moto: await icon(fa.FaMotorcycle, "F50537"),
    crown: await icon(fa.FaCrown, "F50537"),
    bull: await icon(fa.FaGaugeHigh, "F50537"),
    ring: await icon(fa.FaRegCircle, "F50537"),
    pin: await icon(fa.FaLocationDot, "F50537"),
    factory: await icon(fa.FaIndustry, "F50537"),
    hist: await icon(fa.FaClockRotateLeft, "F50537"),
    chart: await icon(fa.FaChartLine, "F50537"),
  };

  const card = (s, name, x, y, w, h) =>
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { objectName: name, x, y, w, h, rectRadius: 0.12, fill: { color: C.text2 }, line: { color: C.accent3, width: 0.75 } });
  const iconCircle = (s, name, img, x, y, d = 0.5) => {
    s.addShape(pres.shapes.OVAL, { objectName: name + "_bg", x, y, w: d, h: d, fill: { color: C.accent3 }, line: { type: "none" } });
    s.addImage({ objectName: name + "_ic", data: img, x: x + d * 0.25, y: y + d * 0.25, w: d * 0.5, h: d * 0.5 });
  };
  const ALTS = {};
  const video = (s, clip, alt) => (ALTS[pres.slides.length] = alt,
    s.addMedia({ objectName: "video", type: "video", path: `${CLIPS}/${clip}.mp4`, cover: b64(`/tmp/deck/${clip}-cover.png`), x: 0, y: 0, w: 10, h: 5.625, altText: alt }));

  // ---------- 1 Titel (Video) ----------
  pres.addSection({ title: "Einführung" });
  let s = pres.addSlide({ masterName: "VIDEO", sectionTitle: "Einführung" });
  video(s, "intro", "Animierte Titelsequenz: Die vier Ringe zeichnen sich, darunter der Schriftzug AUDI und der Claim Vorsprung durch Technik");
  s.addNotes("Titelfolie. Die HyperFrames-Animation startet automatisch (ca. 8 Sekunden). Begrüßung und Thema: Audi, Geschichte, Technik und Zukunft der Marke mit den vier Ringen.");

  // ---------- 2 Agenda ----------
  s = pres.addSlide({ masterName: "DARK_TITLE_ONLY", sectionTitle: "Einführung" });
  s.addText("ÜBERBLICK", { placeholder: "kicker" });
  s.addText("Was Sie heute erwartet", { placeholder: "title" });
  const ag = [
    ["01", "Ursprünge", "Von August Horch zu den vier Ringen"],
    ["02", "Meilensteine", "117 Jahre Unternehmens­geschichte"],
    ["03", "Technik & Motorsport", "quattro, Le Mans und Formel 1"],
    ["04", "Konzern & Zukunft", "Marken, Zahlen und E-Mobilität"],
  ];
  ag.forEach(([n, t, d], i) => {
    const x = 0.6 + i * 2.25, y = 1.75, w = 2.0;
    card(s, `a${i + 1}_card`, x, y, w, 2.9);
    s.addText(n, { objectName: `a${i + 1}_n`, x: x + 0.25, y: y + 0.25, w: 1.5, h: 0.75, fontSize: 40, bold: true, color: C.accent1, margin: 0, isTextBox: true });
    s.addText(t, { objectName: `a${i + 1}_t`, x: x + 0.25, y: y + 1.25, w: w - 0.5, h: 0.65, fontSize: 16, bold: true, color: C.background1, margin: 0, valign: "top", isTextBox: true });
    s.addText(d, { objectName: `a${i + 1}_d`, x: x + 0.25, y: y + 1.95, w: w - 0.5, h: 0.75, fontSize: 12, color: C.background2, margin: 0, valign: "top", isTextBox: true });
  });
  s.addNotes("Vier Kapitel: Herkunft, wichtigste Wegmarken, Technik und Motorsport, danach Konzernstruktur, Kennzahlen und der Weg in die Elektromobilität.");

  // ---------- 3 Ursprünge ----------
  pres.addSection({ title: "Geschichte" });
  s = pres.addSlide({ masterName: "DARK_TITLE_ONLY", sectionTitle: "Geschichte" });
  s.addText("KAPITEL 01  ·  URSPRÜNGE", { placeholder: "kicker" });
  s.addText("Alles beginnt mit einem Namen", { placeholder: "title" });
  card(s, "a1_card", 0.6, 1.7, 3.3, 3.0);
  s.addText("1909", { objectName: "a1_year", x: 0.85, y: 1.95, w: 2.9, h: 1.3, fontSize: 72, bold: true, color: C.background1, margin: 0, isTextBox: true });
  s.addText("Gründung in Zwickau", { objectName: "a1_cap", x: 0.85, y: 3.3, w: 2.9, h: 0.4, fontSize: 16, bold: true, color: C.accent1, margin: 0, isTextBox: true });
  s.addText("„audi“ ist Latein für „horch!“", { objectName: "a1_cap2", x: 0.85, y: 3.75, w: 2.9, h: 0.7, fontSize: 13, italic: true, color: C.background2, margin: 0, valign: "top", isTextBox: true });
  const orig = [
    [I.user, "Der Gründer", "August Horch verlässt 1909 sein erstes Unternehmen und gründet in Zwickau ein neues."],
    [I.quote, "Der Name", "Seinen eigenen Namen darf er nicht mehr verwenden. Also übersetzt er „Horch“ ins Lateinische."],
    [I.car, "Das erste Auto", "Im Mai 1910 entsteht das erste Fahrzeug unter dem Namen Audi."],
  ];
  orig.forEach(([ic, t, d], i) => {
    const y = 1.7 + i * 1.02;
    iconCircle(s, `a${i + 2}_i`, ic, 4.3, y + 0.05);
    s.addText(t, { objectName: `a${i + 2}_t`, x: 5.0, y, w: 4.4, h: 0.32, fontSize: 15, bold: true, color: C.background1, margin: 0, isTextBox: true });
    s.addText(d, { objectName: `a${i + 2}_d`, x: 5.0, y: y + 0.33, w: 4.4, h: 0.6, fontSize: 12, color: C.background2, margin: 0, valign: "top", isTextBox: true });
  });
  s.addNotes("Quelle: Audi Tradition, The history of AUDI AG (audi.com). August Horch gründete 1909 in Zwickau ein neues Unternehmen. Weil er seinen Namen nicht nutzen durfte, wählte er die lateinische Übersetzung: audi = horch. Erstes Fahrzeug im Mai 1910.");

  // ---------- 4 Vier Ringe (Video) ----------
  s = pres.addSlide({ masterName: "VIDEO", sectionTitle: "Geschichte" });
  video(s, "rings", "Animation: Vier Ringe für Audi, DKW, Horch und Wanderer erscheinen nacheinander und schieben sich zum Emblem der Auto Union AG zusammen");
  s.addNotes("29. Juni 1932: Audi, DKW, Horch und die Automobilsparte von Wanderer schließen sich zur Auto Union AG mit Sitz in Chemnitz zusammen. Die vier Ringe stehen für diese vier Gründungsunternehmen. Quelle: Audi Media Center, History of the Four Rings.");

  // ---------- 5 Meilensteine ----------
  s = pres.addSlide({ masterName: "DARK_TITLE_ONLY", sectionTitle: "Geschichte" });
  s.addText("KAPITEL 02  ·  MEILENSTEINE", { placeholder: "kicker" });
  s.addText("117 Jahre in sechs Stationen", { placeholder: "title" });
  const tlx = 0.6, tlw = 8.8, ly = 2.75;
  s.addShape(pres.shapes.LINE, { objectName: "a1_line", x: tlx, y: ly, w: tlw, h: 0, line: { color: C.accent5, width: 1.5 } });
  const ms = [
    ["1909", "Gründung durch August Horch in Zwickau"],
    ["1932", "Auto Union AG: Audi, DKW, Horch, Wanderer"],
    ["1965", "Erster Nachkriegs-Audi, nun unter VW-Dach"],
    ["1980", "quattro: permanenter Allradantrieb in Serie"],
    ["1985", "Umbenennung in AUDI AG, Sitz Ingolstadt"],
    ["2026", "Start als Werksteam in der Formel 1"],
  ];
  const step = tlw / ms.length;
  ms.forEach(([y, d], i) => {
    const cx = tlx + step * i + step / 2;
    const last = i === ms.length - 1;
    s.addShape(pres.shapes.OVAL, { objectName: `a${i + 2}_dot`, x: cx - 0.11, y: ly - 0.11, w: 0.22, h: 0.22, fill: { color: last ? C.accent1 : C.background1 }, line: { color: C.background1, width: 0 } });
    s.addText(y, { objectName: `a${i + 2}_y`, x: cx - step / 2, y: 1.85, w: step, h: 0.5, fontSize: 22, bold: true, color: last ? C.accent1 : C.background1, align: "center", margin: 0, isTextBox: true });
    s.addText(d, { objectName: `a${i + 2}_d`, x: cx - step / 2 + 0.08, y: 3.1, w: step - 0.16, h: 1.2, fontSize: 12, color: C.background2, align: "center", valign: "top", margin: 0, isTextBox: true });
  });
  s.addNotes("Quellen: Audi Tradition, Unternehmensgeschichte (audi.com); Audi Media Center: 60 Jahre erster Nachkriegs-Audi (1965). 1969 fusionierte die Auto Union mit NSU zur Audi NSU Auto Union AG, 1985 folgte die Umbenennung in AUDI AG. 2026 Einstieg in die Formel 1.");

  // ---------- 6 Technik & Motorsport ----------
  pres.addSection({ title: "Technik" });
  s = pres.addSlide({ masterName: "DARK_TITLE_ONLY", sectionTitle: "Technik" });
  s.addText("KAPITEL 03  ·  TECHNIK & MOTORSPORT", { placeholder: "kicker" });
  s.addText("Vorsprung auf der Rennstrecke", { placeholder: "title" });
  card(s, "a1_card", 0.6, 1.7, 3.3, 3.0);
  s.addText("13", { objectName: "a1_n", x: 0.85, y: 1.85, w: 2.9, h: 1.4, fontSize: 88, bold: true, color: C.accent1, margin: 0, isTextBox: true });
  s.addText("Le-Mans-Gesamtsiege", { objectName: "a1_l", x: 0.85, y: 3.3, w: 2.9, h: 0.4, fontSize: 15, bold: true, color: C.background1, margin: 0, valign: "top", isTextBox: true });
  s.addText("von 2000 bis 2014", { objectName: "a1_l2", x: 0.85, y: 3.75, w: 2.9, h: 0.35, fontSize: 12, color: C.background2, margin: 0, isTextBox: true });
  const tech = [
    [I.gears, "1980: quattro", "Permanenter Allradantrieb im Pkw, vorgestellt auf dem Genfer Autosalon."],
    [I.road, "Rallye-Weltmeisterschaft", "Mit dem quattro gewinnt Audi in den 1980ern Marken- und Fahrertitel."],
    [I.trophy, "Le-Mans-Premieren", "Erster Sieg mit Diesel (R10 TDI, 2006) und mit Hybrid (R18 e-tron quattro, 2012)."],
    [I.flag, "2026: Formel 1", "Eigenes Werksteam mit selbst entwickelter Antriebseinheit."],
  ];
  tech.forEach(([ic, t, d], i) => {
    const y = 1.7 + i * 0.78;
    iconCircle(s, `a${i + 2}_i`, ic, 4.3, y + 0.02, 0.46);
    s.addText(t, { objectName: `a${i + 2}_t`, x: 5.0, y, w: 4.4, h: 0.3, fontSize: 14, bold: true, color: C.background1, margin: 0, isTextBox: true });
    s.addText(d, { objectName: `a${i + 2}_d`, x: 5.0, y: y + 0.3, w: 4.4, h: 0.45, fontSize: 11, color: C.background2, margin: 0, valign: "top", isTextBox: true });
  });
  s.addNotes("Le Mans: 13 Gesamtsiege von 2000 bis 2014. 2006 erster Le-Mans-Sieg eines Dieselfahrzeugs (R10 TDI), 2012 erster Sieg eines Hybridfahrzeugs (R18 e-tron quattro). quattro-Debüt 1980 in Genf. Seit 2026 tritt Audi mit eigenem Werksteam in der Formel 1 an.");

  // ---------- 7 Kennzahlen (Video) ----------
  pres.addSection({ title: "Konzern & Zukunft" });
  s = pres.addSlide({ masterName: "VIDEO", sectionTitle: "Konzern & Zukunft" });
  video(s, "numbers", "Animierte Kennzahlen 2025: 65,5 Mrd. Euro Umsatz, 1,62 Mio. ausgelieferte Audi, über 223.000 Elektroautos, 84.186 Beschäftigte");
  s.addNotes("Kennzahlen Geschäftsjahr 2025 (Audi Konzern): Umsatzerlöse 65.503 Mio. Euro (Vorjahr 64.532). Auslieferungen Marke Audi 1.623.551 (Vorjahr 1.671.218). Über 223.000 E-Autos, rund +36 %. Operative Umsatzrendite 5,1 % (Vorjahr 6,0 %). Beschäftigte zum Periodenende 84.186. Quellen: Audi Quarterly Update FY2025; Audi Pressemitteilung vom 17.03.2026 (audi.com).");

  // ---------- 8 Markengruppe ----------
  s = pres.addSlide({ masterName: "DARK_TITLE_ONLY", sectionTitle: "Konzern & Zukunft" });
  s.addText("KAPITEL 04  ·  KONZERN", { placeholder: "kicker" });
  s.addText("Vier Marken unter einem Dach", { placeholder: "title" });
  card(s, "a1_card", 0.6, 1.7, 3.0, 2.9);
  s.addText([
    { text: "1.644.429", options: { fontSize: 36, bold: true, color: C.background1, breakLine: true, paraSpaceAfter: 8 } },
    { text: "Automobile hat die Markengruppe 2025 ausgeliefert, dazu 50.895 Motorräder.", options: { fontSize: 13, color: C.background2 } },
  ], { objectName: "a1_stat", x: 0.85, y: 1.95, w: 2.5, h: 2.4, margin: 0, valign: "middle", isTextBox: true });
  const brands = [
    [I.ring, "Audi", "Premium-Automobile, Sitz in Ingolstadt"],
    [I.bull, "Lamborghini", "Supersportwagen aus Sant’Agata Bolognese"],
    [I.crown, "Bentley", "Luxus-Automobile aus Crewe, England"],
    [I.moto, "Ducati", "Sportmotorräder aus Bologna"],
  ];
  brands.forEach(([ic, t, d], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 3.9 + col * 2.9, y = 1.7 + row * 1.55, w = 2.6, h = 1.35;
    card(s, `a${i + 2}_card`, x, y, w, h);
    iconCircle(s, `a${i + 2}_i`, ic, x + 0.22, y + 0.22, 0.44);
    s.addText(t, { objectName: `a${i + 2}_t`, x: x + 0.8, y: y + 0.24, w: w - 1.0, h: 0.4, fontSize: 16, bold: true, color: C.background1, margin: 0, valign: "middle", isTextBox: true });
    s.addText(d, { objectName: `a${i + 2}_d`, x: x + 0.22, y: y + 0.8, w: w - 0.44, h: 0.45, fontSize: 11, color: C.background2, margin: 0, valign: "top", isTextBox: true });
  });
  s.addNotes("Zur Markengruppe Progressive (Audi Konzern) gehören Audi, Lamborghini, Bentley und Ducati. Auslieferungen 2025: 1.644.429 Automobile (Vorjahr 1.692.548) und 50.895 Motorräder (Vorjahr 54.495). Quelle: Audi Pressemitteilung vom 17.03.2026.");

  // ---------- 9 Elektro (Video) ----------
  s = pres.addSlide({ masterName: "VIDEO", sectionTitle: "Konzern & Zukunft" });
  video(s, "electric", "Kapitelanimation: Die Zukunft fährt elektrisch, eine Batterie lädt sich auf, E-Auslieferungen 2025 plus 36 Prozent");
  s.addNotes("Überleitung zur Elektrifizierung. E-Auslieferungen 2025 stiegen um rund 36 % auf über 223.000 Fahrzeuge (Audi Pressemitteilung, Januar 2026).");

  // ---------- 10 E-Strategie ----------
  s = pres.addSlide({ masterName: "DARK_TITLE_ONLY", sectionTitle: "Konzern & Zukunft" });
  s.addText("ELEKTRIFIZIERUNG", { placeholder: "kicker" });
  s.addText("Vier Schritte in die elektrische Ära", { placeholder: "title" });
  const ev = [
    [I.plug, "2018", "e-tron", "Das erste vollelektrische Serienmodell der Marke."],
    [I.layers, "2024", "PPE-Plattform", "Gemeinsam mit Porsche entwickelt, Basis für Q6 e-tron und A6 e-tron."],
    [I.globe, "2024", "AUDI in China", "Neue Marke mit SAIC, gezielt für chinesische Kunden."],
    [I.bolt, "2026", "Formel 1", "Hybrid-Antrieb mit hohem elektrischem Anteil als Technologie­labor."],
  ];
  ev.forEach(([ic, y, t, d], i) => {
    const x = 0.6 + i * 2.25, top = 1.7, w = 2.0;
    card(s, `a${i + 1}_card`, x, top, w, 3.0);
    iconCircle(s, `a${i + 1}_i`, ic, x + 0.25, top + 0.25, 0.5);
    s.addText(y, { objectName: `a${i + 1}_y`, x: x + 0.25, y: top + 0.95, w: w - 0.5, h: 0.4, fontSize: 13, bold: true, color: C.accent1, margin: 0, isTextBox: true });
    s.addText(t, { objectName: `a${i + 1}_t`, x: x + 0.25, y: top + 1.33, w: w - 0.5, h: 0.4, fontSize: 16, bold: true, color: C.background1, margin: 0, isTextBox: true });
    s.addText(d, { objectName: `a${i + 1}_d`, x: x + 0.25, y: top + 1.8, w: w - 0.5, h: 1.05, fontSize: 12, color: C.background2, margin: 0, valign: "top", isTextBox: true });
  });
  s.addNotes("e-tron (2018) als erstes vollelektrisches Serienmodell. Premium Platform Electric (PPE) mit Porsche, erste Modelle Q6 e-tron und A6 e-tron. 2024: neue Marke AUDI (ohne Ringe) in Kooperation mit SAIC für den chinesischen Markt. Formel 1 ab 2026: Das neue Reglement setzt auf einen deutlich höheren elektrischen Leistungsanteil.");

  // ---------- 11 Standorte ----------
  s = pres.addSlide({ masterName: "DARK_TITLE_ONLY", sectionTitle: "Konzern & Zukunft" });
  s.addText("PRODUKTION", { placeholder: "kicker" });
  s.addText("Gebaut in Europa, Amerika und Asien", { placeholder: "title" });
  card(s, "a1_card", 0.6, 1.7, 3.3, 3.0);
  iconCircle(s, "a1_i", I.pin, 0.85, 1.95, 0.55);
  s.addText("Ingolstadt", { objectName: "a1_t", x: 0.85, y: 2.75, w: 2.9, h: 0.55, fontSize: 26, bold: true, color: C.background1, margin: 0, isTextBox: true });
  s.addText("Konzernzentrale und Stammwerk, Sitz der AUDI AG seit 1985", { objectName: "a1_d", x: 0.85, y: 3.35, w: 2.9, h: 0.9, fontSize: 13, color: C.background2, margin: 0, valign: "top", isTextBox: true });
  const sites = [
    ["Neckarsulm", "Deutschland", "Zweites deutsches Stammwerk"],
    ["Győr", "Ungarn", "Motoren und Fahrzeuge, Audi Hungaria"],
    ["San José Chiapa", "Mexiko", "Werk für den Audi Q5"],
    ["Changchun & Foshan", "China", "Fertigung mit Partner FAW"],
  ];
  sites.forEach(([n, l, d], i) => {
    const y = 1.7 + i * 0.77;
    iconCircle(s, `a${i + 2}_i`, I.factory, 4.3, y + 0.04, 0.46);
    s.addText([
      { text: n, options: { bold: true, color: C.background1, fontSize: 14 } },
      { text: "   " + l, options: { color: C.accent1, fontSize: 11 } },
    ], { objectName: `a${i + 2}_t`, x: 5.0, y, w: 4.4, h: 0.3, margin: 0, isTextBox: true });
    s.addText(d, { objectName: `a${i + 2}_d`, x: 5.0, y: y + 0.3, w: 4.4, h: 0.35, fontSize: 11, color: C.background2, margin: 0, isTextBox: true });
  });
  s.addNotes("Wichtige Produktionsstandorte: Ingolstadt (Zentrale), Neckarsulm, Győr (Audi Hungaria), San José Chiapa (Mexiko) und in China mit FAW. Das Werk Brüssel hat die Produktion Ende Februar 2025 eingestellt. Für Vorträge die aktuelle Standortliste auf audi.com prüfen.");

  // ---------- 12 Fazit ----------
  pres.addSection({ title: "Abschluss" });
  s = pres.addSlide({ masterName: "DARK_TITLE_ONLY", sectionTitle: "Abschluss" });
  s.addText("FAZIT", { placeholder: "kicker" });
  s.addText("Drei Gedanken zum Mitnehmen", { placeholder: "title" });
  const fz = [
    [I.hist, "Herkunft als Markenkern", "Die vier Ringe erzählen bis heute von vier sächsischen Marken und 117 Jahren Geschichte."],
    [I.gears, "Technik als Versprechen", "quattro, TDI und e-tron haben „Vorsprung durch Technik“ immer wieder eingelöst."],
    [I.chart, "Wandel unter Druck", "Elektrifizierung und Formel 1 sind große Zukunftswetten, bei einer operativen Rendite von 5,1 % (2025)."],
  ];
  fz.forEach(([ic, t, d], i) => {
    const x = 0.6 + i * 3.0, w = 2.8;
    card(s, `a${i + 1}_card`, x, 1.7, w, 3.0);
    iconCircle(s, `a${i + 1}_i`, ic, x + 0.28, 1.98, 0.55);
    s.addText(t, { objectName: `a${i + 1}_t`, x: x + 0.28, y: 2.75, w: w - 0.56, h: 0.6, fontSize: 16, bold: true, color: C.background1, margin: 0, valign: "top", isTextBox: true });
    s.addText(d, { objectName: `a${i + 1}_d`, x: x + 0.28, y: 3.4, w: w - 0.56, h: 1.15, fontSize: 12, color: C.background2, margin: 0, valign: "top", isTextBox: true });
  });
  s.addNotes("Zusammenfassung: Tradition, Technikkompetenz und der laufende Umbau. Operative Umsatzrendite 2025: 5,1 % (Vorjahr 6,0 %), Quelle: Audi Pressemitteilung vom 17.03.2026.");

  // ---------- 13 Danke (Video) ----------
  s = pres.addSlide({ masterName: "VIDEO", sectionTitle: "Abschluss" });
  video(s, "outro", "Abschlussanimation: Vier Ringe, Vielen Dank, Fragen und Diskussion");
  s.addNotes("Dank und Überleitung zur Diskussion.");

  fs.writeFileSync("/tmp/deck/alts.json", JSON.stringify(ALTS));
  await pres.writeFile({ fileName: "/tmp/deck/AUDI_Praesentation.pptx" });
  await applyTheme("/tmp/deck/AUDI_Praesentation.pptx", THEME);
  console.log("written");
})();
