# 10 krasse Gesetze (TikTok, 1080x1920, ca. 75 s)

Animiert mit HyperFrames, Voiceover mit ElevenLabs (Stimme „Jan – Social Media Creator“, Modell eleven_v4).
Alle Animationen sind auf die Wort-Zeitstempel des Voiceovers synchronisiert (`assets/words.json`).

## Fertigstellen mit Ton

1. Voiceover aus dem ElevenLabs-Flow herunterladen und als `assets/voiceover.mp3` ablegen.
2. `node build.mjs && npx hyperframes render -o renders/gesetze-tiktok.mp4 -f 30 -w 4`

`build.mjs` erkennt die MP3 automatisch und bindet sie als Audiospur ein.

## Skript

> Zehn Gesetze, die es wirklich gibt. Und sie werden immer krasser.
> **10** Schweiz: Ein Meerschweinchen darfst du nicht allein halten. Es braucht per Gesetz Gesellschaft.
> **9** Venedig: Tauben füttern ist verboten. Wer erwischt wird, zahlt Strafe.
> **8** Island: Ein staatliches Komitee muss den Vornamen deines Babys genehmigen.
> **7** Japan: Ab 40 wird dein Bauchumfang gemessen. Liegst du drüber, gibt's eine Gesundheitsberatung.
> **6** Singapur: Der Verkauf von Kaugummi ist seit 1992 verboten.
> **5** China: Ein tibetischer Lama braucht eine staatliche Genehmigung, um wiedergeboren zu werden.
> **4** Thailand: Für Kritik am König drohen bis zu 15 Jahre Haft. Pro Fall. Ein Mann bekam 50 Jahre.
> **3** Brunei: Seit 2019 steht die Steinigung im Strafgesetz.
> **2** Afghanistan: Frauen dürfen ihre Stimme in der Öffentlichkeit nicht hören lassen.
> **1** Nordkorea: Für das Verbreiten südkoreanischer Serien droht die Todesstrafe. Wer sie nur schaut, kann im Arbeitslager landen.
> Welches Gesetz schockt dich am meisten? Schreib's in die Kommentare!

## Quellen (Primärrecht bzw. etablierte Medien)

| # | Gesetz | Quelle |
|---|---|---|
| 10 | Schweiz, Meerschweinchen | Tierschutzverordnung (TSchV, SR 455.1), Art. 13 und Anhang 1 (fedlex.admin.ch) |
| 9 | Venedig, Taubenfütterung | Verbot der Stadt Venedig seit 2008 (Comune di Venezia, Regolamento di Polizia Urbana) |
| 8 | Island, Vornamen | Lög um mannanöfn Nr. 45/1996, Mannanafnanefnd (althingi.is) |
| 7 | Japan, Bauchumfang | „Metabo-Gesetz“ 2008, Gesundheitschecks für 40 bis 74-Jährige (Ministry of Health, Labour and Welfare; NYT 2008) |
| 6 | Singapur, Kaugummi | Regulation of Imports and Exports (Chewing Gum) Regulations, seit 1992 (sso.agc.gov.sg) |
| 5 | China, Reinkarnation | State Religious Affairs Bureau Order No. 5 (2007) |
| 4 | Thailand, Majestätsbeleidigung | Strafgesetzbuch §112 (3 bis 15 Jahre pro Fall); Urteil gegen Mongkol Thirakot, Jan. 2024, 50 Jahre (Reuters, AP) |
| 3 | Brunei, Steinigung | Syariah Penal Code Order 2013, voll in Kraft seit April 2019 (UN OHCHR, BBC); Moratorium auf Vollstreckung angekündigt |
| 2 | Afghanistan, Frauenstimmen | Taliban-Gesetz zur „Förderung der Tugend“, Aug. 2024 (UNAMA, BBC, AP) |
| 1 | Nordkorea, ausländische Medien | Reactionary Ideology and Culture Rejection Act, 2020 (Südkoreanisches Vereinigungsministerium, Nordkorea-Menschenrechtsbericht 2023; BBC) |
