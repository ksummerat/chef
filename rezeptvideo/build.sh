#!/usr/bin/env bash
# Baut das Rezeptvideo im Higgsfield-Sandbox (higgsedit ist dort vorinstalliert).
# Erwartet: assets/shot_0..9.png und assets/vo_0..9.mp3 (siehe assets.json).
set -euxo pipefail

higgsedit init proj --size 1080x1920 --fps 30
higgsedit fonts add proj Anton "Inter:400" "Inter:700"
python3 gen_edit.py
higgsedit build edit.jsx
higgsedit render proj --engine node --out renders/final.mp4
ffprobe -v error -show_entries format=duration:stream=width,height,codec_name \
        -of default=nw=1 proj/renders/final.mp4
