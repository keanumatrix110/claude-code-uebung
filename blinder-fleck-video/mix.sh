#!/usr/bin/env bash
# Legt Sounddesign (und optional ein Voiceover) unter das gerenderte Video.
# Nutzung:
#   ./mix.sh                      -> out/blinder-fleck.mp4 nur mit Sounddesign
#   ./mix.sh public/voiceover.mp3 -> mit Voiceover, Sounddesign wird darunter leiser gemacht
set -euo pipefail
cd "$(dirname "$0")"
VIDEO=out/video_stumm.mp4
if [ $# -ge 1 ]; then
  ffmpeg -y -loglevel error -i "$VIDEO" -i audio/sfx.wav -i "$1" -filter_complex \
    "[2:a]volume=1.0,asplit=2[vo][key];[1:a]volume=0.6[bg];[bg][key]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=300[duck];[duck][vo]amix=inputs=2:normalize=0,alimiter[a]" \
    -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest out/blinder-fleck_mit_voiceover.mp4
  echo "Fertig: out/blinder-fleck_mit_voiceover.mp4"
else
  ffmpeg -y -loglevel error -i "$VIDEO" -i audio/sfx.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/blinder-fleck.mp4
  echo "Fertig: out/blinder-fleck.mp4"
fi
