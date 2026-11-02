# Video-Pipeline

Skript -> ElevenLabs-Voiceover (`eleven_v3`, deutsch) -> Bilder pro Szene -> ffmpeg-Zusammenschnitt.

**Output:** 1080x1920, 30 fps, H.264 High + AAC, `.mp4` mit Faststart, dazu `cover.jpg`, `untertitel.ass` und `schnittliste.json`.

## Einrichtung

```bash
pip install requests          # ffmpeg/ffprobe mit libass müssen installiert sein
export ELEVENLABS_API_KEY=...
export ELEVENLABS_VOICE_ID=...   # oder "voice_id" in storyboard.json
```

## Bilder ablegen

Pro Szene in `bilder/`, benannt nach der Szenen-ID, in der gewünschten Reihenfolge:

```
bilder/01_hook_1.jpg  bilder/01_hook_2.jpg
bilder/02_hebel_1.jpg bilder/02_hebel_2.jpg bilder/02_hebel_3.jpg ...
```

Alternativ: Unterordner `bilder/02_hebel/` oder explizite Liste unter `"bilder"` in der Szene.
Braucht eine Szene mehr Bildwechsel als Bilder vorhanden sind, wird zyklisch wiederholt (mit wechselnder Zoomrichtung).
Bilder werden mittig auf 9:16 zugeschnitten.

## Starten

```bash
python3 pipeline.py storyboard.json                       # echter Lauf
python3 pipeline.py storyboard.json --mock-tts --platzhalter   # Testlauf ohne API und ohne Bilder
```

Das Voiceover wird zwischengespeichert (`out/arbeit/voice_<hash>.mp3`). Änderst du nur Bilder oder
Schnitt-Parameter, kostet ein neuer Render keine Credits. Neu vertonen: `--neu-vertonen`.

## Wie geschnitten wird

- Das ganze Skript wird in **einem** TTS-Aufruf erzeugt, damit Betonung und Emotions-Tags durchgehend wirken.
- Wortzeiten kommen aus dem `with-timestamps`-Endpunkt; Tags in `[...]` werden ignoriert. Passen sie zu weniger
  als 90 % zum Skript, wird automatisch ElevenLabs Forced Alignment genutzt.
- Szenenwechsel: 0,1 s vor dem ersten Wort der neuen Szene.
- Innerhalb einer Szene: Bildwechsel etwa alle `bildwechsel_sek` (Standard 2,0), eingerastet auf Sprechpausen
  oder Wortanfänge, mindestens 1 s pro Bild.
- Zoom: `zoom` = 0.08 (8 %), abwechselnd rein/raus.
- Untertitel: mittig, weiß mit schwarzer Kontur, max. 3 Wörter pro Einblendung, getrennt an Satzzeichen.
- Frame 0 des Videos ist untertitelfrei, `cover.jpg` enthält nur die Hook-Zeilen aus `"cover"`, keinen Dialog.
