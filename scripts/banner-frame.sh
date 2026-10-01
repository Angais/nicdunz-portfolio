#!/bin/sh
# Inlines the loop video's first frame into CSS so the banner paints with the page.
# Rerun whenever public/banner-loop-*.mp4 changes. Untagged videos render brighter than this frame, so tag
# new encodes with: -bsf:v h264_metadata=colour_primaries=1:transfer_characteristics=13:matrix_coefficients=6
set -e
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

ffmpeg -v error -i public/banner-loop-2400.mp4 -frames:v 1 "$tmp/frame.png"
cwebp -quiet -resize 1200 0 -q 55 -m 6 -sharp_yuv "$tmp/frame.png" -o "$tmp/frame.webp"

printf '.frame {\n  background: url("data:image/webp;base64,%s") center / cover no-repeat;\n}\n' \
  "$(base64 < "$tmp/frame.webp" | tr -d '\n')" > src/components/BannerFrame.module.css
