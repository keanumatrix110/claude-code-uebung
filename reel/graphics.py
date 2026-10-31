"""Erzeugt Doku-Grafikszenen (9:16) für Szenen, zu denen kein KI-Bild vorliegt.
Schreibt nur Dateien, die in img/ noch fehlen."""
import math, os, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1080, 1920
FONT = "/usr/share/fonts/opentype/inter/InterDisplay-ExtraBold.otf"
RED = (220, 40, 35)
random.seed(7)


def base(spot=(540, 700), r=900, tint=(60, 18, 14)):
    img = Image.new("RGB", (W, H), (6, 6, 8))
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(glow)
    d.ellipse([spot[0] - r, spot[1] - r, spot[0] + r, spot[1] + r], fill=tint)
    glow = glow.filter(ImageFilter.GaussianBlur(r // 2))
    img = Image.blend(img, glow, 0.9)
    # Filmkorn
    noise = Image.effect_noise((W, H), 18).convert("RGB")
    return Image.blend(img, noise, 0.04)


def bottle(img, cx, bottom, h, alpha=255):
    w = h * 0.36
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    neck_w, cap_h, neck_h, sh_h = w * 0.36, h * 0.07, h * 0.12, h * 0.14
    top = bottom - h
    # Körper
    d.rounded_rectangle([cx - w / 2, top + cap_h + neck_h + sh_h * 0.5, cx + w / 2, bottom],
                        radius=w * 0.18, fill=(38, 14, 8, alpha))
    # Schulter
    d.polygon([(cx - neck_w / 2, top + cap_h + neck_h), (cx + neck_w / 2, top + cap_h + neck_h),
               (cx + w / 2, top + cap_h + neck_h + sh_h), (cx - w / 2, top + cap_h + neck_h + sh_h)],
              fill=(38, 14, 8, alpha))
    d.rectangle([cx - neck_w / 2, top + cap_h, cx + neck_w / 2, top + cap_h + neck_h + 2],
                fill=(45, 18, 10, alpha))
    # Deckel
    d.rounded_rectangle([cx - neck_w * 0.6, top, cx + neck_w * 0.6, top + cap_h],
                        radius=4, fill=(200, 30, 28, alpha))
    # Etikett
    ly = top + h * 0.48
    d.rectangle([cx - w / 2, ly, cx + w / 2, ly + h * 0.2], fill=(*RED, alpha))
    d.rectangle([cx - w / 2, ly + h * 0.085, cx + w / 2, ly + h * 0.105], fill=(245, 240, 235, alpha))
    # Glanzlicht
    d.rounded_rectangle([cx - w * 0.32, top + cap_h + neck_h + sh_h, cx - w * 0.22, bottom - h * 0.06],
                        radius=6, fill=(255, 255, 255, int(alpha * 0.18)))
    img.alpha_composite(layer)


def sugar(d, x, y, s):
    d.rectangle([x, y, x + s, y + s], fill=(242, 240, 235), outline=(190, 188, 182), width=2)
    d.polygon([(x, y), (x + s * 0.25, y - s * 0.22), (x + s * 1.25, y - s * 0.22), (x + s, y)],
              fill=(255, 255, 252), outline=(200, 198, 192))
    d.polygon([(x + s, y), (x + s * 1.25, y - s * 0.22), (x + s * 1.25, y + s * 0.78), (x + s, y + s)],
              fill=(205, 203, 198), outline=(180, 178, 172))


def label(d, text, xy, size=40, fill=(230, 230, 230)):
    f = ImageFont.truetype(FONT, size)
    tw = d.textlength(text, font=f)
    d.text((xy[0] - tw / 2, xy[1]), text, font=f, fill=fill)


def s03():
    img = base().convert("RGBA")
    for row in range(2):
        for i in range(4):
            bottle(img, 255 + i * 190, 720 + row * 470, 400)
    return img


def s04():
    img = base(tint=(80, 10, 10), r=1000).convert("RGBA")
    cols, rows = 20, 10
    for r in range(rows):
        for c in range(cols):
            bottle(img, 40 + c * 50.5, 230 + (r + 1) * 102, 92)
    d = ImageDraw.Draw(img)
    # Mensch als Größenvergleich
    d.ellipse([515, 1060, 565, 1110], fill=(0, 0, 0))
    d.rounded_rectangle([505, 1110, 575, 1290], radius=18, fill=(0, 0, 0))
    return img


def kidney(d, cx, cy, flip):
    pts = []
    for t in range(0, 360, 3):
        a = math.radians(t)
        r = 1 + 0.12 * math.cos(2 * a)
        x = 150 * r * math.cos(a)
        y = 250 * r * math.sin(a)
        # Einbuchtung (Nierenhilus) zur Körpermitte
        if math.cos(a) > 0.6:
            x -= 90 * (math.cos(a) - 0.6) / 0.4
        pts.append((cx + (-x if flip else x), cy + y))
    d.polygon(pts, fill=(150, 30, 35))


def s05():
    img = base(tint=(20, 30, 60)).convert("RGBA")
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    kidney(gd, 300, 760, False)
    kidney(gd, 780, 760, True)
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(40)))
    img.alpha_composite(glow)
    d = ImageDraw.Draw(img)
    # Gefäße
    for x in (540,):
        d.line([(x, 300), (x, 1250)], fill=(180, 40, 45), width=26)
        d.line([(x + 34, 300), (x + 34, 1250)], fill=(50, 90, 200), width=22)
    for cx, sgn in ((300, 1), (780, -1)):
        d.line([(cx + sgn * 95, 760), (540, 760)], fill=(180, 40, 45), width=16)
        d.line([(cx + sgn * 95, 800), (574, 800)], fill=(50, 90, 200), width=12)
        # Harnleiter
        d.line([(cx + sgn * 80, 830), (cx + sgn * 120, 1200)], fill=(230, 200, 90), width=10)
    # Tropfen
    for i in range(5):
        x, y = 200 + i * 170, 1180
        d.ellipse([x, y, x + 34, y + 34], fill=(80, 160, 255))
        d.polygon([(x + 3, y + 12), (x + 17, y - 22), (x + 31, y + 12)], fill=(80, 160, 255))
    return img


def cell(d, cx, cy, r, swollen):
    col = (170, 40, 50) if not swollen else (120, 150, 220)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col, outline=(240, 240, 240), width=4)
    d.ellipse([cx - r * 0.3, cy - r * 0.3, cx + r * 0.3, cy + r * 0.3], fill=(70, 20, 40))


def s06():
    img = base(tint=(30, 20, 60)).convert("RGBA")
    d = ImageDraw.Draw(img)
    cell(d, 260, 520, 110, False)
    cell(d, 760, 520, 210, True)
    for a in range(0, 360, 45):
        rad = math.radians(a)
        x1, y1 = 760 + 300 * math.cos(rad), 520 + 300 * math.sin(rad)
        x2, y2 = 760 + 235 * math.cos(rad), 520 + 235 * math.sin(rad)
        d.line([(x1, y1), (x2, y2)], fill=(80, 160, 255), width=8)
        d.ellipse([x1 - 10, y1 - 10, x1 + 10, y1 + 10], fill=(80, 160, 255))
    label(d, "NORMAL", (260, 660), 44)
    label(d, "GESCHWOLLEN", (760, 780), 44, (130, 180, 255))
    # Kopf im Profil mit Gehirn
    d.ellipse([290, 900, 790, 1330], outline=(200, 200, 210), width=10)
    brain = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(brain)
    bd.ellipse([320, 925, 760, 1300], fill=(220, 50, 50, 255))
    img.alpha_composite(brain.filter(ImageFilter.GaussianBlur(30)))
    d = ImageDraw.Draw(img)
    for i in range(14):
        x = 360 + i * 27
        d.arc([x - 40, 970 + (i % 3) * 60, x + 40, 1050 + (i % 3) * 60], 200, 340, fill=(255, 200, 200), width=5)
    # Druckpfeile nach außen
    for a in (200, 250, 290, 340):
        rad = math.radians(a)
        x1, y1 = 540 + 230 * math.cos(rad), 1115 + 200 * math.sin(rad)
        x2, y2 = 540 + 300 * math.cos(rad), 1115 + 260 * math.sin(rad)
        d.line([(x1, y1), (x2, y2)], fill=(255, 220, 80), width=8)
    return img


def s08():
    img = base().convert("RGBA")
    for i in range(12):
        bottle(img, 70 + i * 85, 720, 330)
    d = ImageDraw.Draw(img)
    s = 46
    rows = 12
    for r in range(rows):
        n = rows - r
        for c in range(n * 2 - 1):
            x = 540 - (n * 2 - 1) * s * 0.55 + c * s * 1.1 + random.uniform(-3, 3)
            y = 1250 - r * s * 0.95 + random.uniform(-2, 2)
            sugar(d, x, y, s)
    return img


def s09():
    img = base(tint=(10, 40, 20), r=800).convert("RGBA")
    d = ImageDraw.Draw(img)
    for x in range(0, W, 60):
        d.line([(x, 350), (x, 1250)], fill=(20, 55, 30), width=1)
    for y in range(350, 1260, 60):
        d.line([(0, y), (W, y)], fill=(20, 55, 30), width=1)
    pts, x = [], 0
    beats = [0, 1, 1, 0, 1, 0, 0, 1, 1, 1]
    i = 0
    while x < W:
        y0 = 800
        if beats[i % len(beats)]:
            step = random.choice([70, 110, 150])
            seq = [(0, 0), (10, -20), (20, 0), (30, 40), (40, -280 + random.randint(-80, 80)),
                   (50, 160), (60, 0), (step, 0)]
        else:
            step = 90
            seq = [(i2 * 10, random.randint(-60, 60)) for i2 in range(9)]
        for dx, dy in seq:
            pts.append((x + dx, y0 + dy))
        x += step
        i += 1
    line = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(line)
    ld.line(pts, fill=(60, 255, 110, 255), width=7, joint="curve")
    img.alpha_composite(line.filter(ImageFilter.GaussianBlur(14)))
    img.alpha_composite(line)
    d = ImageDraw.Draw(img)
    d.ellipse([900, 400, 960, 460], fill=(255, 40, 40))
    label(d, "♥ ARRHYTHMIE", (540, 1150), 54, (255, 80, 80))
    return img


def s10():
    img = base(spot=(540, 650), r=600, tint=(40, 12, 10)).convert("RGBA")
    for i in range(5):
        bottle(img, 240 + i * 150, 820, 300, alpha=200)
    for i in range(7):
        bottle(img, 120 + i * 140, 1130, 340)
    return img


SCENES = {3: s03, 4: s04, 5: s05, 6: s06, 8: s08, 9: s09, 10: s10}

if __name__ == "__main__":
    os.makedirs(os.path.join(HERE, "img"), exist_ok=True)
    for n, fn in SCENES.items():
        p = os.path.join(HERE, "img", f"{n:02d}.jpg")
        if os.path.exists(p):
            print("vorhanden, übersprungen:", p)
            continue
        fn().convert("RGB").save(p, quality=94)
        print("erstellt:", p)
