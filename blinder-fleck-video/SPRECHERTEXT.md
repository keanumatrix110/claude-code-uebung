# Sprechertext "Blinder Fleck" (TikTok)

Das Video ist auf das ElevenLabs-Voiceover in `public/voiceover.mp3` abgestimmt.
In `audio/voiceover_timed.wav` ist bei 18,5 s eine zusätzliche Pause von 2 s eingefügt (Zeit für den Test).
Die Szenenzeiten stehen in `src/theme.ts`, die genauen Einsätze als Kommentare in den Szenen.

## Ursprüngliche Planung (36,7 Sek.)

Die Zeiten passen exakt zu den Szenen im Video. Wenn du selbst sprichst oder eine KI-Stimme nutzt,
orientiere dich an den Zeitmarken. Danach: Datei als `public/voiceover.mp3` speichern und
`./mix.sh public/voiceover.mp3` ausführen.

| Zeit | Text | Ton |
|---|---|---|
| 0:00 | Du siehst gerade nicht alles. | leise, eindringlich |
| 0:01,7 | Und dein Gehirn verheimlicht es dir. | geheimnisvoll |
| 0:03,3 | Ich beweis es dir. Jetzt. | selbstbewusst, "Jetzt" kurz und hart |
| 0:05,3 | Halt dir das linke Auge zu. | klar, anleitend |
| 0:08,3 | Schau mit dem rechten Auge nur auf das Kreuz. Nur aufs Kreuz! | betont |
| 0:11,3 | Und jetzt zieh dein Handy ganz langsam näher ran… | langsam |
| 0:14,3 | …und wieder ein Stück weg. | langsam |
| 0:15,3 | *(Pause)* … Der Punkt ist weg, oder? | flüsternd |
| 0:17,3 | Das ist dein blinder Fleck! Genau da, wo der Sehnerv dein Auge verlässt… | begeistert |
| 0:20,7 | …hast du keine einzige Sehzelle. | betont |
| 0:23,0 | Und dein Gehirn? Malt die Lücke einfach zu. | neugierig |
| 0:25,2 | Es erfindet also gerade ein Stück von deinem Bild. | ruhig, wirken lassen |
| 0:27,3 | Und ein Oktopus? Hat dieses Problem gar nicht. | amüsiert |
| 0:30,0 | Seine Augen sind einfach besser verkabelt als unsere. | locker |
| 0:32,3 | Hat's bei dir geklappt? Schreib "weg" oder "nicht weg" in die Kommentare. | direkt, freundlich |

## Video neu rendern (nach Änderungen)

```bash
npm i
npx remotion render BlinderFleck out/video_stumm.mp4
./make_sfx.sh                          # Sounddesign neu erzeugen
./mix.sh audio/voiceover_timed.wav     # Stimme + Sounddesign drunterlegen
```
