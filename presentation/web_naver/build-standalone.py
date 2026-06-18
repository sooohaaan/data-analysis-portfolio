#!/usr/bin/env python3
# KOKKOK EV 발표 덱 → 단일 자체완결 HTML 빌드
#   CSS·JS·이미지·프로토타입을 한 파일에 인라인 → 파일 1개만 공유하면 오프라인 더블클릭으로 전 기능 동작.
#   (폰트만 CDN @import 유지 — 오프라인은 시스템 폰트로 폴백)
# 사용: python3 build-standalone.py
import base64, io, os, re, sys

DIR = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(DIR, "kokkok-ev-presentation.html")
OUT = os.path.join(DIR, "kokkok-ev-presentation.standalone.html")

MIME = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".gif": "image/gif", ".svg": "image/svg+xml", ".webp": "image/webp"}

def read(p):  return io.open(p, encoding="utf-8").read()

html = read(SRC)

# 1) CSS 인라인 (@import 폰트는 style 블록 상단에 그대로 유지)
css = read(os.path.join(DIR, "assets/css/style.css"))
html = html.replace(
    '<link rel="stylesheet" href="assets/css/style.css">',
    "<style>\n" + css + "\n</style>")

# 2) JS 인라인 (순서 유지: d3 → charts → deck). </script> 시퀀스 이스케이프.
for js in ["assets/js/d3.v7.min.js", "assets/js/charts.js", "assets/js/deck.js"]:
    code = read(os.path.join(DIR, js)).replace("</script>", "<\\/script>")
    html = html.replace('<script src="%s"></script>' % js,
                         "<script>\n" + code + "\n</script>")

# 3) 프로토타입 iframe: src → srcdoc (인라인). 속성값이므로 & 와 " 이스케이프.
proto = read(os.path.join(DIR, "assets/prototype/prototype.html"))
proto_attr = proto.replace("&", "&amp;").replace('"', "&quot;")
html = html.replace('src="assets/prototype/prototype.html"',
                    'srcdoc="' + proto_attr + '"')

# 4) 이미지(src="assets/...") → data URI. (스크립트/프로토타입 경로는 위에서 이미 치환됨)
def to_data_uri(path):
    ext = os.path.splitext(path)[1].lower()
    mime = MIME.get(ext)
    if not mime:
        return None
    with open(os.path.join(DIR, path), "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    return "data:%s;base64,%s" % (mime, b64)

count = {"ok": 0, "miss": 0}
def repl(m):
    path = m.group(1)
    uri = to_data_uri(path)
    if uri is None:
        count["miss"] += 1
        return m.group(0)
    count["ok"] += 1
    return 'src="' + uri + '"'

html = re.sub(r'src="(assets/[^"]+\.(?:png|jpe?g|gif|svg|webp))"', repl, html)

io.open(OUT, "w", encoding="utf-8").write(html)
size_mb = os.path.getsize(OUT) / (1024 * 1024)
left = len(re.findall(r'src="assets/', html))
print("이미지 인라인: %d개 (스킵 %d) · 잔여 assets/ 참조: %d" % (count["ok"], count["miss"], left))
print("✅ %s  (%.1f MB)" % (OUT, size_mb))
