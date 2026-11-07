#!/usr/bin/env bash
# Legt Stimme und Sounddesign unter ein gerendertes Video.
# Nutzung: ./mix.sh <video> <sounddesign> <voiceover> <ausgabe>
# Beispiel: ./mix.sh out/schmerz_stumm.mp4 audio/sfx_schmerz.wav public/voiceover_schmerz.mp3 out/schmerz.mp4
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -y -loglevel error -i "$1" -i "$2" -i "$3" -filter_complex \
  "[2:a]volume=1.0,asplit=2[vo][key];[1:a]volume=0.6[bg];[bg][key]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=300[duck];[duck][vo]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
  -map 0:v -map "[a]" -c:v copy -ar 48000 -c:a aac -b:a 192k "$4"
echo "Fertig: $4"
