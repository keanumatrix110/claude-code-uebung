#!/usr/bin/env bash
# Erzeugt das Sounddesign (audio/sfx.wav), passend zu den Szenenzeiten in src/theme.ts.
set -euo pipefail
cd "$(dirname "$0")/audio"
D=49.4
ffmpeg -y -loglevel error -f lavfi -i "sine=f=55:d=$D" -f lavfi -i "sine=f=82.5:d=$D" -filter_complex "[0][1]amix=2,volume=0.5,tremolo=f=0.3:d=0.4,afade=t=in:d=1,afade=t=out:st=48:d=1.4" drone.wav
ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=d=0.5:c=pink" -af "highpass=f=400,lowpass=f=5000,afade=t=in:d=0.25,afade=t=out:st=0.25:d=0.25,volume=0.9" whoosh.wav
ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=d=0.18:c=white" -f lavfi -i "sine=f=140:d=0.18" -filter_complex "[0][1]amix=2,acrusher=bits=4:mode=log,volume=0.6" glitch.wav
ffmpeg -y -loglevel error -f lavfi -i "sine=f=58:d=0.9" -af "afade=t=out:st=0.05:d=0.85,volume=3" boom.wav
ffmpeg -y -loglevel error -f lavfi -i "sine=f=1320:d=0.35" -af "afade=t=out:st=0.02:d=0.33,volume=0.5" ding.wav
# Zeitpunkte in ms: Glitches (Hook), Whooshes (Schnitte), Boom ("Jetzt"), Dings ("Punkt weg?", CTA)
ffmpeg -y -loglevel error -i drone.wav \
  -i glitch.wav -i glitch.wav -i glitch.wav \
  -i whoosh.wav -i whoosh.wav -i whoosh.wav -i whoosh.wav -i whoosh.wav \
  -i boom.wav -i ding.wav -i ding.wav -filter_complex "\
[1]adelay=200:all=1[g1];[2]adelay=1270:all=1[g2];[3]adelay=2170:all=1[g3];\
[4]adelay=4200:all=1[w1];[5]adelay=6300:all=1[w2];[6]adelay=22400:all=1[w3];[7]adelay=38300:all=1[w4];[8]adelay=44200:all=1[w5];\
[9]adelay=5780:all=1[b1];[10]adelay=21050:all=1[d1];[11]adelay=44550:all=1[d2];\
[0][g1][g2][g3][w1][w2][w3][w4][w5][b1][d1][d2]amix=inputs=12:normalize=0,volume=0.8,alimiter" -t $D sfx.wav
echo "Fertig: audio/sfx.wav"
