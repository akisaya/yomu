#!/usr/bin/env bash
# 重建自托管的标题字体：从 google/fonts 取完整 TTF，按 glyphs.txt 子集化成 woff2。
#
# 什么时候要跑：
#   - 新增作品，标题里出现了 glyphs.txt 里没有的字
#   - 改了标题层的字号/字重，需要重铺
#
# 依赖：python3、pip install fonttools brotli（或建个 venv）
# 用法：bash .agent/skills/japanese-drama-line-study/scripts/build_title_fonts.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
OUT="$ROOT/assets/fonts"
GLYPHS="$OUT/glyphs.txt"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

PYFTSUBSET="${PYFTSUBSET:-pyftsubset}"
command -v "$PYFTSUBSET" >/dev/null || { echo "缺 pyftsubset：pip install fonttools brotli"; exit 1; }
[ -f "$GLYPHS" ] || { echo "缺 $GLYPHS"; exit 1; }

for w in Regular Medium SemiBold; do
  case $w in
    Regular)  num=400 ;;
    Medium)   num=500 ;;
    SemiBold) num=600 ;;
  esac
  url="https://raw.githubusercontent.com/google/fonts/main/ofl/shipporimincho/ShipporiMincho-$w.ttf"
  echo "取 $w"
  curl -fsSL --max-time 120 -o "$TMP/$w.ttf" "$url"
  "$PYFTSUBSET" "$TMP/$w.ttf" \
    --text-file="$GLYPHS" \
    --flavor=woff2 \
    --no-hinting \
    --layout-features='*' \
    --drop-tables+=DSIG \
    --output-file="$OUT/shippori-mincho-$num.woff2"
  printf "  %s  %s\n" "shippori-mincho-$num.woff2" "$(du -h "$OUT/shippori-mincho-$num.woff2" | cut -f1)"
done

echo "完成。记得确认三处：字形没有回退、竖排标点没坏、页面里 preload 指向的是 500。"
