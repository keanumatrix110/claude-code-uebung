#!/usr/bin/env python3
"""Video-Pipeline: Skript -> ElevenLabs-Voiceover (eleven_v3) -> Bilder pro Szene -> ffmpeg.

Ablauf
  1. Storyboard (JSON) lesen: Szenen mit Text (inkl. v3-Audio-Tags) und Bildern.
  2. Voiceover in EINEM Durchgang erzeugen (durchgehende Betonung), inkl. Zeitstempel.
     Passen die Zeitstempel nicht sauber zum Text, wird per Forced Alignment nachjustiert.
  3. Schnittliste: Szenenwechsel exakt am Stimmeinsatz, innerhalb einer Szene
     Bildwechsel ca. alle 2 s, bevorzugt in Sprechpausen bzw. an Wortanfängen.
  4. Clips mit leichtem Zoom (abwechselnd rein/raus) rendern, zusammenfügen,
     Untertitel (mittig, schlicht) einbrennen, Audio drunter.
  5. Hook-Cover (cover.jpg) ohne Dialog-Untertitel; Frame 0 des Videos bleibt ebenfalls frei.

Aufruf
  export ELEVENLABS_API_KEY=...   ELEVENLABS_VOICE_ID=...
  python3 pipeline.py storyboard.json
  python3 pipeline.py storyboard.json --mock-tts --platzhalter   # Testlauf ohne API/Bilder
"""
from __future__ import annotations

import argparse
import base64
import difflib
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

API = "https://api.elevenlabs.io/v1"
TAG_RE = re.compile(r"\[[^\]]*\]")
BILD_EXT = (".jpg", ".jpeg", ".png", ".webp")
LEAD = 0.10        # Schnitt so viel vor dem Stimmeinsatz (s)
MIN_CLIP = 1.0     # kürzester Clip innerhalb einer Szene (s)
SNAP_RADIUS = 0.7  # wie weit ein Bildwechsel zum nächsten Wortanfang/zur Pause rutschen darf (s)


# --------------------------------------------------------------------------- Hilfen
def log(msg: str) -> None:
    print(f"[pipeline] {msg}", flush=True)


def run(cmd: list[str], cwd: Path | None = None) -> None:
    res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if res.returncode != 0:
        sys.stderr.write(res.stderr[-4000:])
        raise SystemExit(f"Befehl fehlgeschlagen: {' '.join(cmd[:6])} ...")


def probe_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    return float(out)


def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", TAG_RE.sub(" ", text)).strip()


def norm(word: str) -> str:
    return re.sub(r"[^\wäöüß]", "", word.lower())


def font_file(bold: bool = True) -> str:
    pattern = "DejaVu Sans:bold" if bold else "DejaVu Sans"
    try:
        out = subprocess.run(["fc-match", "-f", "%{file}", pattern], capture_output=True, text=True).stdout
        if out:
            return out
    except FileNotFoundError:
        pass
    return "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


@dataclass
class Wort:
    text: str          # Anzeigeform inkl. Satzzeichen
    szene: int
    start: float = 0.0
    ende: float = 0.0


# --------------------------------------------------------------------------- Storyboard
def lade_storyboard(pfad: Path) -> dict:
    sb = json.loads(pfad.read_text(encoding="utf-8"))
    if not sb.get("szenen"):
        raise SystemExit("Storyboard enthält keine Szenen.")
    return sb


def woerter_aus_szenen(szenen: list[dict]) -> list[Wort]:
    woerter: list[Wort] = []
    for i, sz in enumerate(szenen):
        for tok in clean_text(sz["text"]).split():
            if norm(tok):
                woerter.append(Wort(tok, i))
            elif woerter:  # reines Satzzeichen an das vorige Wort hängen
                woerter[-1].text += tok
    return woerter


def bilder_fuer_szene(sz: dict, basis: Path) -> list[Path]:
    if sz.get("bilder"):
        pfade = [(basis / b).resolve() for b in sz["bilder"]]
    else:
        ordner = basis / "bilder"
        pfade = sorted(p for p in ordner.glob(f"{sz['id']}*") if p.suffix.lower() in BILD_EXT)
        unter = ordner / sz["id"]
        if not pfade and unter.is_dir():
            pfade = sorted(p for p in unter.iterdir() if p.suffix.lower() in BILD_EXT)
    fehlend = [p for p in pfade if not p.exists()]
    if fehlend:
        raise SystemExit(f"Bild nicht gefunden: {fehlend[0]}")
    if not pfade:
        raise SystemExit(
            f"Keine Bilder für Szene '{sz['id']}'. Lege sie als bilder/{sz['id']}_1.jpg, "
            f"bilder/{sz['id']}_2.jpg ... ab, trage sie unter \"bilder\" ein "
            f"oder starte mit --platzhalter."
        )
    return pfade


def erzeuge_platzhalter(szenen: list[dict], ordner: Path, w: int, h: int) -> None:
    ordner.mkdir(parents=True, exist_ok=True)
    farben = ["0x1d3557", "0x6a040f", "0x2d6a4f", "0x5a189a", "0x7f5539", "0x003049"]
    font = font_file()
    for i, sz in enumerate(szenen):
        for n in range(1, 4):
            ziel = ordner / f"{sz['id']}_{n}.jpg"
            if ziel.exists():
                continue
            label = ordner / f".label_{sz['id']}_{n}.txt"
            label.write_text(f"{sz['id']}  Bild {n}", encoding="utf-8")
            run(["ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c={farben[i % len(farben)]}:s={w}x{h}",
                 "-vf", f"drawgrid=w={w // 6}:h={w // 6}:t=2:c=white@0.25,"
                        f"drawtext=fontfile={font}:textfile={label}:fontsize=64:fontcolor=white:"
                        f"x=(w-tw)/2:y=h*0.12",
                 "-frames:v", "1", str(ziel)])
            label.unlink()
    log(f"Platzhalterbilder in {ordner}")


# --------------------------------------------------------------------------- ElevenLabs
def _post(url: str, key: str, **kw):
    import requests  # erst hier, damit --mock-tts ohne requests läuft
    r = requests.post(url, headers={"xi-api-key": key}, timeout=300, **kw)
    if r.status_code >= 400:
        raise SystemExit(f"ElevenLabs-Fehler {r.status_code}: {r.text[:800]}")
    return r.json()


def tts_mit_zeitstempeln(text: str, cfg: dict, key: str, voice: str, mp3: Path) -> list[tuple[str, float, float]]:
    body = {
        "text": text,
        "model_id": cfg.get("model_id", "eleven_v3"),
        "language_code": cfg.get("language_code", "de"),
        "voice_settings": {"stability": cfg.get("stability", 0.5)},
    }
    fmt = cfg.get("output_format", "mp3_44100_192")
    data = _post(f"{API}/text-to-speech/{voice}/with-timestamps?output_format={fmt}", key, json=body)
    mp3.write_bytes(base64.b64decode(data["audio_base64"]))
    al = data.get("alignment") or {}
    return woerter_aus_zeichen(al.get("characters", []),
                               al.get("character_start_times_seconds", []),
                               al.get("character_end_times_seconds", []))


def woerter_aus_zeichen(chars, starts, ends) -> list[tuple[str, float, float]]:
    """Zeichen-Alignment -> Wörter; Inhalte in [eckigen Klammern] (Audio-Tags) werden übersprungen."""
    out, buf, t0, t1, im_tag = [], "", None, None, False
    for c, s, e in zip(chars, starts, ends):
        if c == "[":
            im_tag = True
        if im_tag or c.isspace():
            if buf:
                out.append((buf, t0, t1))
            buf, t0 = "", None
            if c == "]":
                im_tag = False
            continue
        if t0 is None:
            t0 = s
        buf += c
        t1 = e
    if buf:
        out.append((buf, t0, t1))
    return [(w, s, e) for w, s, e in out if norm(w)]


def forced_alignment(mp3: Path, text: str, key: str) -> list[tuple[str, float, float]]:
    with mp3.open("rb") as f:
        data = _post(f"{API}/forced-alignment", key, files={"file": (mp3.name, f, "audio/mpeg")},
                     data={"text": text})
    return [(w["text"], w["start"], w["end"]) for w in data.get("words", []) if norm(w["text"])]


def mock_tts(szenen: list[dict], mp3: Path) -> list[tuple[str, float, float]]:
    """Stille + geschätzte Wortzeiten, um Schnitt/Untertitel ohne API zu testen."""
    t, out = 0.15, []
    for sz in szenen:
        for teil in re.split(r"(\[[^\]]*\])", sz["text"]):
            if TAG_RE.fullmatch(teil or ""):
                t += 0.45 if "pause" in teil else 0.0
                continue
            for tok in teil.split():
                if not norm(tok):
                    continue
                d = 0.16 + 0.055 * len(norm(tok))
                out.append((tok, t, t + d))
                t += d + (0.35 if tok[-1] in ".?!" else 0.18 if tok[-1] in ",:" else 0.06)
    run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", f"{t + 0.3:.3f}",
         "-c:a", "libmp3lame", "-b:a", "128k", str(mp3)])
    return out


def zuordnen(woerter: list[Wort], timing: list[tuple[str, float, float]]) -> float:
    """Überträgt Zeiten per Sequenzabgleich auf die Skriptwörter. Rückgabe: Trefferquote."""
    a = [norm(w.text) for w in woerter]
    b = [norm(t[0]) for t in timing]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    gesetzt = [False] * len(woerter)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            w, t = woerter[blk.a + k], timing[blk.b + k]
            w.start, w.ende, gesetzt[blk.a + k] = t[1], t[2], True
    # Lücken (z. B. Zahlen, die ausgeschrieben wurden) linear interpolieren
    i = 0
    while i < len(woerter):
        if gesetzt[i]:
            i += 1
            continue
        j = i
        while j < len(woerter) and not gesetzt[j]:
            j += 1
        t_a = woerter[i - 1].ende if i > 0 else 0.0
        t_b = woerter[j].start if j < len(woerter) else (timing[-1][2] if timing else t_a + 0.4 * (j - i))
        schritt = (t_b - t_a) / (j - i)
        for k in range(i, j):
            woerter[k].start = t_a + schritt * (k - i)
            woerter[k].ende = woerter[k].start + schritt * 0.9
        i = j
    return sum(gesetzt) / max(1, len(woerter))


# --------------------------------------------------------------------------- Schnitt
def schnittliste(woerter: list[Wort], n_szenen: int, gesamt: float, ziel: float) -> list[tuple[int, float, float]]:
    """Liefert [(szene, start, ende)] für jeden Clip."""
    grenzen = [0.0]
    for s in range(1, n_szenen):
        vor = [w for w in woerter if w.szene == s - 1]
        nach = [w for w in woerter if w.szene == s]
        if not nach:
            grenzen.append(grenzen[-1])
            continue
        frueh = vor[-1].ende + 0.02 if vor else grenzen[-1]
        grenzen.append(max(frueh, nach[0].start - LEAD))
    grenzen.append(gesamt)

    clips = []
    for s in range(n_szenen):
        a, b = grenzen[s], grenzen[s + 1]
        dauer = b - a
        if dauer <= 0:
            continue
        n = max(1, round(dauer / ziel))
        while n > 1 and dauer / n < MIN_CLIP:
            n -= 1
        ws = [w for w in woerter if w.szene == s]
        # Kandidaten: Wortanfänge (kurz davor geschnitten); Pausen > 0.15 s werden bevorzugt
        kand = []
        for k, w in enumerate(ws[1:], 1):
            t = max(ws[k - 1].ende, w.start - LEAD)
            pause = w.start - ws[k - 1].ende
            kand.append((t, 0.0 if pause > 0.15 else 0.35))
        punkte, letzter = [a], a
        for i in range(1, n):
            ideal = a + dauer * i / n
            beste = None
            for t, malus in kand:
                if t - letzter < MIN_CLIP or b - t < MIN_CLIP:
                    continue
                score = abs(t - ideal) + malus
                if abs(t - ideal) <= SNAP_RADIUS and (beste is None or score < beste[0]):
                    beste = (score, t)
            t = beste[1] if beste else ideal
            if t - letzter >= MIN_CLIP and b - t >= MIN_CLIP:
                punkte.append(t)
                letzter = t
        punkte.append(b)
        clips += [(s, punkte[i], punkte[i + 1]) for i in range(len(punkte) - 1)]
    return clips


def render_clip(bild: Path, frames: int, ziel: Path, w: int, h: int, fps: int, zoom: float, rein: bool) -> None:
    f = 2  # Hochskalierung gegen Zoompan-Ruckeln
    z0, z1 = (1.0, 1.0 + zoom) if rein else (1.0 + zoom, 1.0)
    z = f"{z0}+({z1 - z0})*on/{max(1, frames - 1)}"
    vf = (f"scale={w * f}:{h * f}:force_original_aspect_ratio=increase:flags=lanczos,"
          f"crop={w * f}:{h * f},setsar=1,"
          f"zoompan=z='{z}':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d={frames}:s={w}x{h}:fps={fps},"
          f"format=yuv420p")
    run(["ffmpeg", "-y", "-i", str(bild), "-vf", vf, "-frames:v", str(frames), "-r", str(fps),
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "12", "-an", str(ziel)])


# --------------------------------------------------------------------------- Untertitel
def ass_zeit(t: float) -> str:
    cs = int(round(t * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def untertitel(woerter: list[Wort], w: int, h: int, fps: int, pfad: Path) -> None:
    # erst an Satzzeichen/Szenen trennen, dann gleichmäßig in Blöcke (max. 3 Wörter, ~18 Zeichen)
    saetze, akt = [], []
    for i, wo in enumerate(woerter):
        akt.append(wo)
        naechst = woerter[i + 1] if i + 1 < len(woerter) else None
        if naechst is None or naechst.szene != wo.szene or wo.text[-1] in ".?!:,":
            saetze.append(akt)
            akt = []
    blocks = []
    for satz in saetze:
        zeichen = sum(len(x.text) + 1 for x in satz)
        n = max(-(-len(satz) // 3), -(-zeichen // 19), 1)
        n = min(n, len(satz))
        grenzen = [round(len(satz) * k / n) for k in range(n + 1)]
        blocks += [satz[grenzen[k]:grenzen[k + 1]] for k in range(n)]
    frame0_frei = 1.0 / fps  # erster Frame ohne Text (Plattform-Cover)
    zeilen = []
    for i, bl in enumerate(blocks):
        start = max(bl[0].start, frame0_frei)
        ende = bl[-1].ende + 0.15
        if i + 1 < len(blocks):
            nst = blocks[i + 1][0].start
            ende = nst if nst - ende < 0.25 else min(ende, nst)
        text = " ".join(x.text for x in bl).rstrip(".,")
        text = text.replace("{", "(").replace("}", ")").replace("\\", "")
        zeilen.append(f"Dialogue: 0,{ass_zeit(start)},{ass_zeit(ende)},Default,,0,0,0,,{text}")
    kopf = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {w}
PlayResY: {h}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,DejaVu Sans,{int(h * 0.04)},&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,1,0,0,0,100,100,0,0,1,{max(3, int(h * 0.0028))},0,5,{int(w * 0.08)},{int(w * 0.08)},0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    pfad.write_text(kopf + "\n".join(zeilen) + "\n", encoding="utf-8")


# --------------------------------------------------------------------------- Cover
def cover(bild: Path, zeilen: list[str], ziel: Path, w: int, h: int, arbeit: Path) -> None:
    font = font_file()
    gr = int(h * 0.075)
    filt = [f"scale={w}:{h}:force_original_aspect_ratio=increase:flags=lanczos,crop={w}:{h},setsar=1",
            "drawbox=x=0:y=0:w=iw:h=ih:color=black@0.25:t=fill"]
    y0 = int(h * 0.42 - len(zeilen) * gr * 1.1 / 2)  # mittig, sicher im 3:4-Feed-Ausschnitt
    for i, z in enumerate(zeilen):
        tf = arbeit / f"cover_zeile_{i}.txt"
        tf.write_text(z, encoding="utf-8")
        filt.append(f"drawtext=fontfile={font}:textfile={tf}:fontsize={gr}:fontcolor=white:"
                    f"borderw={max(4, gr // 12)}:bordercolor=black:x=(w-tw)/2:y={y0 + int(i * gr * 1.1)}")
    run(["ffmpeg", "-y", "-i", str(bild), "-vf", ",".join(filt), "-frames:v", "1", "-q:v", "2", str(ziel)])


# --------------------------------------------------------------------------- Main
def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("storyboard", type=Path)
    ap.add_argument("--out", type=Path, default=None, help="Ausgabeordner (Standard: <storyboard-ordner>/out)")
    ap.add_argument("--mock-tts", action="store_true", help="kein API-Aufruf, stilles Audio mit geschätzten Zeiten")
    ap.add_argument("--platzhalter", action="store_true", help="fehlende Bilder als Platzhalter erzeugen")
    ap.add_argument("--neu-vertonen", action="store_true", help="Voiceover-Cache ignorieren (kostet Credits)")
    args = ap.parse_args()

    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            raise SystemExit(f"{tool} nicht gefunden.")

    sb = lade_storyboard(args.storyboard)
    basis = args.storyboard.resolve().parent
    out = (args.out or basis / "out").resolve()
    arbeit = out / "arbeit"
    arbeit.mkdir(parents=True, exist_ok=True)

    tts, vid = sb.get("tts", {}), sb.get("video", {})
    W, H, FPS = vid.get("breite", 1080), vid.get("hoehe", 1920), vid.get("fps", 30)
    szenen = sb["szenen"]

    # 1) Text
    voll = " ".join(sz["text"].strip() for sz in szenen)
    sauber = clean_text(voll)
    woerter = woerter_aus_szenen(szenen)
    log(f"{len(szenen)} Szenen, {len(woerter)} Wörter, {len(voll)} Zeichen")

    # 2) Voiceover (mit Cache, damit Re-Renders keine Credits kosten)
    key = os.environ.get("ELEVENLABS_API_KEY", "")
    voice = os.environ.get("ELEVENLABS_VOICE_ID") or tts.get("voice_id") or ""
    sig = hashlib.sha256(json.dumps([voll, voice, tts, args.mock_tts], sort_keys=True).encode()).hexdigest()[:12]
    mp3, tjson = arbeit / f"voice_{sig}.mp3", arbeit / f"timing_{sig}.json"
    if mp3.exists() and tjson.exists() and not args.neu_vertonen:
        log("Voiceover aus Cache")
        timing = [tuple(x) for x in json.loads(tjson.read_text())]
    elif args.mock_tts:
        log("Mock-Voiceover (stumm)")
        timing = mock_tts(szenen, mp3)
    else:
        if not key or not voice:
            raise SystemExit("ELEVENLABS_API_KEY und ELEVENLABS_VOICE_ID (oder tts.voice_id) setzen.")
        log(f"ElevenLabs TTS ({tts.get('model_id', 'eleven_v3')}, {tts.get('language_code', 'de')})")
        timing = tts_mit_zeitstempeln(voll, tts, key, voice, mp3)
        quote = zuordnen([Wort(w.text, w.szene) for w in woerter], timing) if timing else 0.0
        if quote < 0.9:
            log(f"Zeitstempel passen nur zu {quote:.0%}, nutze Forced Alignment")
            timing = forced_alignment(mp3, sauber, key)
    tjson.write_text(json.dumps(timing, ensure_ascii=False))
    quote = zuordnen(woerter, timing)
    log(f"Wort-Zuordnung: {quote:.0%}")

    audio_dauer = probe_duration(mp3)
    gesamt = audio_dauer + vid.get("nachlauf_sek", 0.6)

    # 3) Bilder + Schnittliste
    if args.platzhalter:
        erzeuge_platzhalter(szenen, basis / "bilder", W, H)
    bilder = [bilder_fuer_szene(sz, basis) for sz in szenen]
    clips = schnittliste(woerter, len(szenen), gesamt, vid.get("bildwechsel_sek", 2.0))

    # auf Frame-Raster runden (kumulativ, kein Drift)
    rahmen = [round(c[1] * FPS) for c in clips] + [round(gesamt * FPS)]
    plan, zaehler = [], {}
    for i, (s, a, b) in enumerate(clips):
        n = rahmen[i + 1] - rahmen[i]
        if n <= 0:
            continue
        k = zaehler.get(s, 0)
        zaehler[s] = k + 1
        plan.append({"szene": szenen[s]["id"], "bild": str(bilder[s][k % len(bilder[s])]),
                     "start": rahmen[i] / FPS, "frames": n})
    (out / "schnittliste.json").write_text(json.dumps(plan, indent=2, ensure_ascii=False))
    log(f"{len(plan)} Clips, Ø {gesamt / len(plan):.2f} s pro Bild")

    # 4) Clips rendern
    liste = arbeit / "clips.txt"
    with liste.open("w") as f:
        for i, p in enumerate(plan):
            ziel = arbeit / f"clip_{i:03d}.mp4"
            render_clip(Path(p["bild"]), p["frames"], ziel, W, H, FPS, vid.get("zoom", 0.08), rein=i % 2 == 0)
            f.write(f"file '{ziel.name}'\n")
    log("Clips gerendert")

    # 5) Untertitel + Endschnitt
    untertitel(woerter, W, H, FPS, arbeit / "untertitel.ass")
    shutil.copy(arbeit / "untertitel.ass", out / "untertitel.ass")
    video = out / f"{re.sub(r'[^A-Za-z0-9_-]+', '_', sb.get('titel', 'video'))}.mp4"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", "clips.txt", "-i", str(mp3),
         "-map", "0:v", "-map", "1:a",
         "-vf", "ass=untertitel.ass", "-r", str(FPS),
         "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-profile:v", "high", "-level", "4.1",
         "-pix_fmt", "yuv420p", "-g", str(FPS * 2),
         "-af", "apad", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
         "-t", f"{rahmen[-1] / FPS:.3f}", "-movflags", "+faststart", str(video)], cwd=arbeit)
    log(f"Video: {video} ({probe_duration(video):.2f} s)")

    # 6) Hook-Cover ohne Dialog
    c = sb.get("cover", {})
    cbild = (basis / c["bild"]) if c.get("bild") else bilder[0][0]
    cover(cbild, c.get("zeilen", []), out / "cover.jpg", W, H, arbeit)
    log(f"Cover: {out / 'cover.jpg'}")


if __name__ == "__main__":
    main()
