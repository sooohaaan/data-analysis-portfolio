#!/usr/bin/env bash
# KOKKOK EV 발표 덱(HTML) → PDF 빌드 — HTML과 동일하게 버전 관리.
# 사용: ./build-pdf.sh   (HTML 변경 후 실행하여 PDF 재생성·커밋)
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
HTML="$DIR/kokkok-ev-presentation.html"
OUT="$DIR/kokkok-ev-presentation.pdf"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP="$(mktemp -t kokkok-pdf-XXXX).pdf"

# 1) 헤드리스 Chrome으로 ?print=1 모드 인쇄(모든 슬라이드 1페이지씩, D3 차트 렌더 대기)
"$CHROME" --headless=new --disable-gpu --no-first-run --no-default-browser-check \
  --virtual-time-budget=25000 --run-all-compositor-stages-before-draw \
  --no-pdf-header-footer --print-to-pdf="$TMP" "file://$HTML?print=1"

# 2) 이미지 다운샘플 압축(벡터 텍스트는 보존). gs 없으면 원본 사용.
if command -v gs >/dev/null 2>&1; then
  gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.5 -dPDFSETTINGS=/ebook \
     -dDownsampleColorImages=true -dColorImageResolution=150 \
     -dDownsampleGrayImages=true  -dGrayImageResolution=150 \
     -dNOPAUSE -dQUIET -dBATCH -sOutputFile="$OUT" "$TMP" && rm -f "$TMP"
else
  mv "$TMP" "$OUT"; echo "⚠ ghostscript 미설치 — 압축 생략. 'brew install ghostscript' 권장."
fi
echo "✅ $OUT  ($(du -h "$OUT" | cut -f1) · $(mdls -name kMDItemNumberOfPages "$OUT" 2>/dev/null | awk '{print $3}')p)"
