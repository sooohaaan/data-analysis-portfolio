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

# 2) Chrome 출력 그대로 사용 (목차·간지 → 슬라이드 내부 링크 보존).
#    ※ ghostscript 압축은 내부 링크 주석을 제거하므로 사용하지 않음.
#    용량은 소스 이미지를 적정 해상도(≤1600px)로 유지해 관리.
mv "$TMP" "$OUT"
# qpdf가 있으면 무손실 선형화(링크 보존, 소폭 최적화)
command -v qpdf >/dev/null 2>&1 && qpdf --linearize --replace-input "$OUT" 2>/dev/null || true
echo "✅ $OUT  ($(du -h "$OUT" | cut -f1) · $(mdls -name kMDItemNumberOfPages "$OUT" 2>/dev/null | awk '{print $3}')p)"
