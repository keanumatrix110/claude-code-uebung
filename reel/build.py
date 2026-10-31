"""Baut das 9:16 Reel aus Szenenbildern + ElevenLabs-Voiceover.

Erwartet:
  reel/img/01.jpg ... 10.jpg   (Szenenbilder, beliebige Größe)
  reel/voice.mp3               (Voiceover)
  reel/timings.json (optional) [[start, ende], ...] in Sekunden pro Szene
Ohne timings.json wird die Länge anteilig nach Textlänge verteilt.
Ausgabe: reel/reel_9x16.mp4
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 30
FONT = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
FONT_SMALL = "/usr/share/fonts/opentype/inter/InterDisplay-ExtraBold.otf"

SCENES = [
    ("WIE VIELE FLASCHEN?", "bis der Körper aufgibt", 70),
    ("50 mg Koffein", "53 g Zucker pro 0,5 l", 70),
    ("8 FLASCHEN", "= 400 mg Koffein, laut EFSA unbedenklich", 120),
    ("200 FLASCHEN", "= 10 g Koffein, lebensgefährlich", 80),
    ("~1 LITER / STUNDE", "mehr schaffen deine Nieren nicht", 85),
    ("HYPONATRIÄMIE", "Zellen schwellen an, auch im Gehirn", 105),
    ("6 LITER IN 3 STUNDEN", "Kalifornien, 2007", 120),
    ("12 FLASCHEN", "636 g Zucker, über 200 Würfel", 105),
    ("10 LITER TÄGLICH", "Neuseeland, 2010", 175),
    ("~12 FLASCHEN", "NICHT NACHMACHEN", 125),
]


def dur(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                   "-of", "csv=p=0", path])
    return float(out)


def fit_text(draw, text, font_path, max_w, start):
    size = start
    while size > 30:
        f = ImageFont.truetype(font_path, size)
        if draw.textlength(text, font=f) <= max_w:
            return f
        size -= 4
    return ImageFont.truetype(font_path, size)


def overlay(i, title, sub, path):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    # Verlauf unten für Lesbarkeit
    grad = Image.new("L", (1, H))
    for y in range(H):
        grad.putpixel((0, y), int(max(0, (y - H * 0.55) / (H * 0.45)) * 210))
    img.paste(Image.new("RGBA", (W, H), (0, 0, 0, 255)), (0, 0), grad.resize((W, H)))
    d = ImageDraw.Draw(img)
    ft = fit_text(d, title, FONT, W - 120, 118)
    fs = fit_text(d, sub, FONT_SMALL, W - 140, 52)
    ty = int(H * 0.70)
    tw = d.textlength(title, font=ft)
    # Schatten
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).text(((W - tw) / 2, ty), title, font=ft, fill=(0, 0, 0, 200))
    img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(10)))
    d = ImageDraw.Draw(img)
    color = (255, 60, 50, 255) if i in (3, 5, 9) else (255, 255, 255, 255)
    d.text(((W - tw) / 2, ty), title, font=ft, fill=color)
    sw = d.textlength(sub, font=fs)
    d.text(((W - sw) / 2, ty + ft.size + 30), sub, font=fs, fill=(235, 235, 235, 255))
    # Doku-Balken oben
    d.rectangle([60, 150, 66, 210], fill=(255, 60, 50, 255))
    d.text((84, 152), "COLA  |  FAKTENCHECK", font=ImageFont.truetype(FONT_SMALL, 40),
           fill=(255, 255, 255, 230))
    img.save(path)


def main():
    voice = os.path.join(HERE, "voice.mp3")
    total = dur(voice) + 0.8
    tpath = os.path.join(HERE, "timings.json")
    if os.path.exists(tpath):
        t = json.load(open(tpath))
        lens = [t[i + 1][0] - t[i][0] if i + 1 < len(t) else total - t[i][0] for i in range(len(t))]
        lens[0] += t[0][0]
    else:
        w = [s[2] for s in SCENES]
        lens = [total * x / sum(w) for x in w]

    tmp = os.path.join(HERE, "tmp")
    os.makedirs(tmp, exist_ok=True)
    clips = []
    for i, ((title, sub, _), L) in enumerate(zip(SCENES, lens)):
        src = os.path.join(HERE, "img", f"{i+1:02d}.jpg")
        ov = os.path.join(tmp, f"ov{i}.png")
        overlay(i, title, sub, ov)
        out = os.path.join(tmp, f"c{i}.mp4")
        n = int(L * FPS) + 1
        zin = i % 2 == 0  # abwechselnd rein und raus zoomen
        z = f"1.0+0.12*on/{n}" if zin else f"1.12-0.12*on/{n}"
        vf = (f"[0:v]scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},"
              f"zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s={W}x{H}:fps={FPS},"
              f"eq=contrast=1.08:saturation=0.9,vignette=PI/5[bg];"
              f"[bg][1:v]overlay=0:0,fade=t=in:st=0:d=0.25,format=yuv420p[v]")
        subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-loop", "1", "-i", src, "-i", ov,
                               "-filter_complex", vf, "-map", "[v]", "-frames:v", str(n),
                               "-c:v", "libx264", "-preset", "medium", "-crf", "18", out])
        clips.append(out)

    lst = os.path.join(tmp, "list.txt")
    open(lst, "w").write("".join(f"file '{c}'\n" for c in clips))
    final = os.path.join(HERE, "reel_9x16.mp4")
    subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst,
                           "-i", voice, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                           "-c:a", "aac", "-b:a", "192k", "-af", "apad", "-shortest",
                           "-movflags", "+faststart", final])
    print("fertig:", final, round(dur(final), 1), "s")


if __name__ == "__main__":
    sys.exit(main())
