#!/usr/bin/env bash
# Sounddesign für "Schmerz zweimal" (audio/sfx_schmerz.wav), passend zu src/schmerz/timing.ts.
set -euo pipefail
cd "$(dirname "$0")/audio"
D=47.5
ffmpeg -y -loglevel error -f lavfi -i "sine=f=49:d=$D" -f lavfi -i "sine=f=73.5:d=$D" -filter_complex "[0][1]amix=2,volume=0.5,tremolo=f=0.25:d=0.4,afade=t=in:d=1,afade=t=out:st=46:d=1.5" drone_s.wav
ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=d=0.5:c=pink" -af "highpass=f=400,lowpass=f=5000,afade=t=in:d=0.25,afade=t=out:st=0.25:d=0.25,volume=0.9" whoosh.wav
ffmpeg -y -loglevel error -f lavfi -i "anoisesrc=d=0.25:c=white" -af "highpass=f=2000,afade=t=out:st=0.02:d=0.23,volume=0.7" zap.wav
ffmpeg -y -loglevel error -f lavfi -i "sine=f=58:d=0.9" -af "afade=t=out:st=0.05:d=0.85,volume=3" boom.wav
ffmpeg -y -loglevel error -f lavfi -i "sine=f=1320:d=0.35" -af "afade=t=out:st=0.02:d=0.33,volume=0.5" ding.wav
# Boom: Zeh 1,0 s / 41,8 s / 44,7 s, Flash 20,0 s | Zap: Blitze 2,7 s, 3,25 s, schneller Reiz 6,6 s | Whoosh: Schnitte | Ding: 1 ms 28,85 s, CTA 45,9 s
ffmpeg -y -loglevel error -i drone_s.wav \
  -i boom.wav -i boom.wav -i boom.wav -i boom.wav \
  -i zap.wav -i zap.wav -i zap.wav \
  -i whoosh.wav -i whoosh.wav -i whoosh.wav -i whoosh.wav -i whoosh.wav -i whoosh.wav \
  -i ding.wav -i ding.wav -filter_complex "\
[1]adelay=1000:all=1[b1];[2]adelay=41800:all=1[b2];[3]adelay=44700:all=1[b3];[4]adelay=19950:all=1[b4];\
[5]adelay=2700:all=1[z1];[6]adelay=3250:all=1[z2];[7]adelay=6600:all=1[z3];\
[8]adelay=6200:all=1[w1];[9]adelay=12730:all=1[w2];[10]adelay=18500:all=1[w3];[11]adelay=23500:all=1[w4];[12]adelay=33000:all=1[w5];[13]adelay=40100:all=1[w6];\
[14]adelay=28850:all=1[d1];[15]adelay=45900:all=1[d2];\
[0][b1][b2][b3][b4][z1][z2][z3][w1][w2][w3][w4][w5][w6][d1][d2]amix=inputs=16:normalize=0,volume=0.8,alimiter" -t $D sfx_schmerz.wav
echo "Fertig: audio/sfx_schmerz.wav"
