const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const ASSET = (f) => path.join(__dirname, "assets", f);
// Look for a deliverable image (png/jpg) in assets/deliverables/ by base name.
// Returns the absolute path if found, else null (slide renders a placeholder).
const DELIV = (base) => {
  for (const ext of [".png", ".jpg", ".jpeg", ".PNG", ".JPG"]) {
    const p = path.join(__dirname, "assets", "deliverables", base + ext);
    if (fs.existsSync(p)) return p;
  }
  return null;
};
// Read image pixel dimensions via macOS sips (for aspect-ratio aware layout).
const imgDims = (p) => {
  try {
    const out = execSync(`sips -g pixelWidth -g pixelHeight "${p}"`, { encoding: "utf8" });
    const w = +(out.match(/pixelWidth:\s*(\d+)/) || [])[1];
    const h = +(out.match(/pixelHeight:\s*(\d+)/) || [])[1];
    if (w && h) return { w, h, r: w / h };
  } catch (e) {}
  return null;
};

// ---- Palette (EV energy / coconut-teal) ----
const C = {
  dark:   "0E2A2E", // deep teal-charcoal  (title / section / closing)
  dark2:  "0A4A45", // panel teal
  teal:   "0D9488", // primary
  tealDk: "115E59",
  tealLt: "5EEAD4",
  amber:  "F59E0B", // energy accent
  amberDk:"B45309",
  red:    "DC2626", // pain points (matches charts)
  ink:    "13262B", // dark text on light
  muted:  "5B7075", // muted gray-teal
  light:  "F3F7F6", // content background
  card:   "FFFFFF",
  line:   "D8E3E1",
  white:  "FFFFFF",
};

const HF = "Georgia";        // header font
const BF = "Calibri";        // body font

const W = 13.333, H = 7.5;
const M = 0.62;              // outer margin

const pres = new pptxgen();
pres.defineLayout({ name: "W16x9", width: W, height: H });
pres.layout = "W16x9";
pres.author = "마수한 · 김재희";
pres.company = "코코넛사일로 (Coconut Silo)";
pres.title = "KOKKOK EV — 데이터로 근거를 만든 PM";

// shadow factory (never reuse objects)
const sh = (o = {}) => ({ type: "outer", color: "0E2A2E", blur: 9, offset: 3, angle: 135, opacity: 0.16, ...o });

// ---------- shared chrome ----------
let pageNo = 0;
function chrome(slide, kicker, title, opts = {}) {
  slide.background = { color: opts.bg || C.light };
  pageNo++;
  // top kicker chip
  slide.addShape(pres.shapes.RECTANGLE, { x: M, y: 0.5, w: 0.16, h: 0.52, fill: { color: C.amber } });
  slide.addText((kicker || "").toUpperCase(), {
    x: M + 0.28, y: 0.46, w: 8, h: 0.3, fontFace: BF, fontSize: 11.5, bold: true,
    color: C.teal, charSpacing: 2, align: "left", valign: "middle", margin: 0,
  });
  slide.addText(title, {
    x: M + 0.28, y: 0.72, w: 11.6, h: 0.66, fontFace: HF, fontSize: 26, bold: true,
    color: C.ink, align: "left", valign: "middle", margin: 0,
  });
  // footer
  slide.addShape(pres.shapes.LINE, { x: M, y: H - 0.5, w: W - 2 * M, h: 0, line: { color: C.line, width: 1 } });
  slide.addText("코코넛사일로 · KOKKOK EV 서비스 기획", {
    x: M, y: H - 0.46, w: 6, h: 0.3, fontFace: BF, fontSize: 9, color: C.muted, align: "left", margin: 0,
  });
  slide.addText(`${pageNo}`, {
    x: W - M - 0.6, y: H - 0.46, w: 0.6, h: 0.3, fontFace: BF, fontSize: 9, color: C.muted, align: "right", margin: 0,
  });
}

// card helper
function card(slide, x, y, w, h, fill = C.card, withShadow = true) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.08, fill: { color: fill },
    line: { color: C.line, width: 1 }, ...(withShadow ? { shadow: sh() } : {}),
  });
}

// stat block
function stat(slide, x, y, w, num, label, color = C.teal, sub) {
  slide.addText(num, { x, y, w, h: 0.78, fontFace: HF, fontSize: 40, bold: true, color, align: "center", valign: "middle", margin: 0 });
  slide.addText(label, { x, y: y + 0.74, w, h: 0.32, fontFace: BF, fontSize: 12.5, bold: true, color: C.ink, align: "center", valign: "top", margin: 0 });
  if (sub) slide.addText(sub, { x, y: y + 1.04, w, h: 0.3, fontFace: BF, fontSize: 9.5, color: C.muted, align: "center", valign: "top", margin: 0 });
}

// ---- chapter system (index + section dividers) ----
const chapStart = {};      // key -> footer page number of the chapter's first content slide
let tocSlide = null;       // index slide ref (page numbers filled at the end)
const tocRowMeta = [];     // {key, x, y, w} for deferred page-number text

function divider(key, no, ko, en, sub) {
  chapStart[key] = pageNo + 1;            // next numbered (chrome) slide
  const s = pres.addSlide();
  s.background = { color: C.dark };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.14, fill: { color: C.amber } });
  s.addShape(pres.shapes.OVAL, { x: W - 3.2, y: -1.9, w: 4.8, h: 4.8, fill: { color: C.dark2, transparency: 38 } });
  s.addShape(pres.shapes.OVAL, { x: W - 1.4, y: 3.9, w: 3.0, h: 3.0, fill: { color: C.tealDk, transparency: 45 } });
  // huge faded chapter number
  s.addText(no, { x: W - 4.6, y: 1.0, w: 4.2, h: 5.2, fontFace: HF, fontSize: 200, bold: true, color: C.dark2, align: "right", valign: "middle", margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: 2.55, w: 0.16, h: 2.0, fill: { color: C.amber } });
  s.addText("CHAPTER " + no, { x: M + 0.42, y: 2.55, w: 8, h: 0.4, fontFace: BF, fontSize: 15, bold: true, color: C.tealLt, charSpacing: 3, margin: 0 });
  s.addText(ko, { x: M + 0.4, y: 3.0, w: 9, h: 1.0, fontFace: HF, fontSize: 48, bold: true, color: C.white, margin: 0 });
  s.addText(en, { x: M + 0.42, y: 4.05, w: 9, h: 0.4, fontFace: HF, fontSize: 18, italic: true, color: C.amber, margin: 0 });
  if (sub) s.addText(sub, { x: M + 0.42, y: 4.55, w: 9.5, h: 0.4, fontFace: BF, fontSize: 14, color: C.tealLt, margin: 0 });
}

// ===================================================================
// 1. TITLE
// ===================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.dark };
  // decorative panels
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.14, fill: { color: C.amber } });
  s.addShape(pres.shapes.OVAL, { x: W - 3.4, y: -2.0, w: 5.2, h: 5.2, fill: { color: C.dark2, transparency: 35 } });
  s.addShape(pres.shapes.OVAL, { x: W - 1.6, y: 3.6, w: 3.4, h: 3.4, fill: { color: C.tealDk, transparency: 45 } });

  s.addText("코코넛사일로  ·  핀테크 서비스 기획 4회차", {
    x: M + 0.1, y: 1.35, w: 10, h: 0.4, fontFace: BF, fontSize: 15, bold: true, color: C.tealLt, charSpacing: 1, margin: 0,
  });
  s.addText("KOKKOK EV", {
    x: M + 0.05, y: 1.95, w: 11, h: 1.2, fontFace: HF, fontSize: 64, bold: true, color: C.white, margin: 0,
  });
  s.addText([
    { text: "데이터로 근거를 만든 PM", options: { color: C.amber, bold: true } },
  ], { x: M + 0.1, y: 3.2, w: 11.5, h: 0.6, fontFace: HF, fontSize: 28, italic: true, margin: 0 });
  s.addText(
    "동남아 EV 충전 시장 VOC 28,890건을 멀티채널로 수집·분석하고,\n그 인사이트를 라오스 KOKKOK EV 서비스 기획으로 연결한 엔드투엔드 프로젝트",
    { x: M + 0.1, y: 3.95, w: 11, h: 0.9, fontFace: BF, fontSize: 15, color: C.tealLt, lineSpacingMultiple: 1.15, margin: 0 }
  );

  // bottom meta row
  const meta = [
    ["분석 대상", "라오스·베트남 (태국 비교군)"],
    ["수집 데이터", "39,700+ 건 · 4개 언어"],
    ["산출물", "PRD · 플로우 · 요금정책"],
    ["발표", "2026-06-19"],
  ];
  const bw = 2.85, gap = 0.18, bx0 = M + 0.05, by = 5.55;
  meta.forEach(([k, v], i) => {
    const x = bx0 + i * (bw + gap);
    s.addShape(pres.shapes.RECTANGLE, { x, y: by, w: 0.06, h: 0.84, fill: { color: C.amber } });
    s.addText(k, { x: x + 0.18, y: by, w: bw - 0.2, h: 0.3, fontFace: BF, fontSize: 10.5, bold: true, color: C.tealLt, charSpacing: 1, margin: 0 });
    s.addText(v, { x: x + 0.18, y: by + 0.32, w: bw - 0.2, h: 0.5, fontFace: BF, fontSize: 12.5, bold: true, color: C.white, margin: 0, valign: "top" });
  });
  s.addText("발표자  마수한 (Data Engineer & PM) · 김재희 (Data Analyst & PM)", {
    x: M + 0.1, y: 6.75, w: 11, h: 0.3, fontFace: BF, fontSize: 11, color: "8FB3AE", margin: 0,
  });
})();

// ===================================================================
// 2. INDEX (목차)
// ===================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.light };
  tocSlide = s;
  // header
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: 0.62, w: 0.16, h: 0.62, fill: { color: C.amber } });
  s.addText("목차 · CONTENTS", { x: M + 0.3, y: 0.58, w: 8, h: 0.32, fontFace: BF, fontSize: 12, bold: true, color: C.teal, charSpacing: 2, valign: "middle", margin: 0 });
  s.addText("발표 목차 — 거시 시장에서 솔루션까지", { x: M + 0.3, y: 0.86, w: 11.5, h: 0.6, fontFace: HF, fontSize: 26, bold: true, color: C.ink, valign: "middle", margin: 0 });

  const chs = [
    ["01", "시장 분석", "Market Analysis · PEST · TAM-SAM-SOM · 경쟁 구도", C.tealDk, "0"],
    ["02", "문제 정의", "Problem · ‘데이터로 근거를’ 핵심 가설", C.teal, "1"],
    ["03", "데이터 수집·분석", "Data & Analysis · VOC 39,700+건 · 감성 · 포지셔닝 · 페르소나", C.teal, "2"],
    ["04", "제품 기획·설계", "Product Planning · 포지셔닝 · PRD · 여정맵 · OCPP · 요금정책", C.amber, "3"],
    ["05", "기대효과 & 회고", "Impact & Retrospective · KPI · 진입 전략 · 회고", C.amber, "4"],
    ["부록", "단계별 산출물 · 용어 사전", "Appendix · 산출물(OCPP·ERD·시퀀스·시나리오·스토리보드·프로토타입) · 용어 사전 — 발표 생략·열람용", C.muted, "A"],
  ];
  const rowH = 0.74, y0 = 1.95;
  chs.forEach(([no, ko, desc, col, key], i) => {
    const y = y0 + i * rowH;
    if (i > 0) s.addShape(pres.shapes.LINE, { x: M, y: y - 0.02, w: W - 2 * M, h: 0, line: { color: C.line, width: 1 } });
    s.addShape(pres.shapes.OVAL, { x: M + 0.12, y: y + 0.13, w: 0.5, h: 0.5, fill: { color: col } });
    s.addText(no === "부록" ? "A" : no, { x: M + 0.12, y: y + 0.13, w: 0.5, h: 0.5, fontFace: HF, fontSize: no === "부록" ? 16 : 17, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    s.addText(ko, { x: M + 0.82, y: y + 0.06, w: 5.0, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: C.ink, valign: "middle", margin: 0 });
    s.addText(desc, { x: M + 0.82, y: y + 0.42, w: 9.5, h: 0.3, fontFace: BF, fontSize: 10.5, color: C.muted, valign: "middle", margin: 0 });
    // deferred page number
    tocRowMeta.push({ key, x: W - M - 1.4, y: y + 0.05, w: 1.4 });
  });
  s.addText("코코넛사일로 · KOKKOK EV 서비스 기획", { x: M, y: H - 0.46, w: 6, h: 0.3, fontFace: BF, fontSize: 9, color: C.muted, margin: 0 });
})();

// ===================================================================
// 3. 프로젝트 개요
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Overview", "프로젝트 개요 — 코코넛사일로 KOKKOK EV");
  // left narrative card
  card(s, M, 1.7, 6.2, 4.9);
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: 1.7, w: 0.14, h: 4.9, fill: { color: C.teal } });
  s.addText("우리가 푼 문제", { x: M + 0.4, y: 1.95, w: 5.6, h: 0.4, fontFace: HF, fontSize: 18, bold: true, color: C.ink, margin: 0 });
  s.addText([
    { text: "KOKKOK Move는 라오스에서 운영 중인 모빌리티 앱입니다. ", options: { bold: true } },
    { text: "전기차 전환이 빨라지는 라오스에서 기존 모빌리티 앱에 ‘쇼핑’과 ‘EV 충전’ 기능을 더해 슈퍼앱으로 발전시키려 했지만, 어떤 EV 충전 앱을 만들어야 하는지에 대한 근거가 없었습니다.", options: {} },
  ], { x: M + 0.4, y: 2.45, w: 5.55, h: 1.4, fontFace: BF, fontSize: 13.5, color: C.ink, lineSpacingMultiple: 1.18, valign: "top", margin: 0 });
  s.addText([
    { text: "그래서 시장의 목소리(VOC)를 직접 수집·분석해 ", options: {} },
    { text: "‘무엇이 불편한가’를 데이터로 증명", options: { bold: true, color: C.teal } },
    { text: "하고, 이를 PRD·플로우·요금정책이라는 ", options: {} },
    { text: "실제 산출물", options: { bold: true, color: C.teal } },
    { text: "로 연결했습니다.", options: {} },
  ], { x: M + 0.4, y: 3.92, w: 5.55, h: 1.25, fontFace: BF, fontSize: 13.5, color: C.ink, lineSpacingMultiple: 1.18, valign: "top", margin: 0 });
  // team
  s.addShape(pres.shapes.LINE, { x: M + 0.4, y: 5.25, w: 5.5, h: 0, line: { color: C.line, width: 1 } });
  s.addText([
    { text: "마수한", options: { bold: true, color: C.ink } },
    { text: "  Data Engineer & PM — 인프라·파이프라인·전처리·PRD·화면설계\n", options: { color: C.muted } },
    { text: "김재희", options: { bold: true, color: C.ink } },
    { text: "  Data Analyst & PM — 데이터 정제·SQL 분석·Tableau·유저 시나리오", options: { color: C.muted } },
  ], { x: M + 0.4, y: 5.4, w: 5.5, h: 1.0, fontFace: BF, fontSize: 11.5, lineSpacingMultiple: 1.25, valign: "top", margin: 0 });

  // right: facts grid
  const facts = [
    ["분석 시장", "라오스 · 베트남\n+ 태국 비교군", C.teal],
    ["핵심 분석 앱", "Green SM · LOCA EV\nPTT · PEA · EleXA", C.teal],
    ["데이터베이스", "PostgreSQL\nSupabase Cloud (SG)", C.amber],
    ["분석 레이어", "앱(SW) + 충전기(HW)\n2개 레이어", C.amber],
  ];
  const gx = M + 6.55, gy = 1.7, gw = (W - M - gx - 0.18) / 2, gh = 2.36, gp = 0.18;
  facts.forEach(([k, v, col], i) => {
    const x = gx + (i % 2) * (gw + gp);
    const y = gy + Math.floor(i / 2) * (gh + gp);
    card(s, x, y, gw, gh);
    s.addShape(pres.shapes.OVAL, { x: x + 0.28, y: y + 0.3, w: 0.22, h: 0.22, fill: { color: col } });
    s.addText(k, { x: x + 0.62, y: y + 0.22, w: gw - 0.7, h: 0.4, fontFace: BF, fontSize: 12, bold: true, color: col, charSpacing: 1, margin: 0, valign: "middle" });
    s.addText(v, { x: x + 0.3, y: y + 0.78, w: gw - 0.55, h: 1.4, fontFace: HF, fontSize: 16.5, bold: true, color: C.ink, lineSpacingMultiple: 1.1, margin: 0, valign: "top" });
  });
})();

divider("0", "01", "시장 분석", "Market Analysis", "거시 환경 · 시장 규모 · 경쟁 구도");

// ===================================================================
// 3.3 [거시] PEST 분석
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Market · Macro", "거시 환경 분석 (PEST) — 라오스 EV, 지금이 진입 적기");
  const quad = [
    ["P", "Political", "정치·정책", C.teal, ["정부 EV 보급 국가전략 (2021)", "내연기관차 수입 제한 (2030)", "충전소 인허가 절차 간소화", "3국 모두 정부 주도 → 규제 리스크 낮음"]],
    ["E", "Economic", "경제", C.tealDk, ["휘발유가 상승 → EV 경제성 개선", "전기 저가 ~647₭/kWh → 충전 원가 우위", "LOCA 충전 4,300₭ ≈ 265원 (저렴)", "드라이버 운영비 40~60% 절감"]],
    ["S", "Social", "사회", C.amber, ["스마트폰 보급률 ~65%", "EV 등록 연 40%+ 성장", "외국인 여행자 Negative 65.8%", "언어·결제 장벽 = 개선 기회"]],
    ["T", "Technology", "기술", C.amberDk, ["전기 보급률 96.5% · 전력 잉여(수출>>수입)", "충전소 41개뿐 → 인프라 공백=기회", "OCPP 1.6J 표준 · 슈퍼앱 통합 성숙", "LOCA 충전소 40 → 100개소"]],
  ];
  const gap = 0.27, cw = (W - 2 * M - 3 * gap) / 4, x0 = M, cy = 1.85, ch = 4.45;
  quad.forEach(([letter, en, ko, col, items], i) => {
    const x = x0 + i * (cw + gap);
    card(s, x, cy, cw, ch);
    s.addShape(pres.shapes.RECTANGLE, { x, y: cy, w: cw, h: 0.86, fill: { color: col } });
    s.addShape(pres.shapes.OVAL, { x: x + 0.22, y: cy + 0.19, w: 0.48, h: 0.48, fill: { color: "FFFFFF" } });
    s.addText(letter, { x: x + 0.22, y: cy + 0.17, w: 0.48, h: 0.48, fontFace: HF, fontSize: 20, bold: true, color: col, align: "center", valign: "middle", margin: 0 });
    s.addText(en, { x: x + 0.8, y: cy + 0.14, w: cw - 0.9, h: 0.34, fontFace: HF, fontSize: 14.5, bold: true, color: C.white, valign: "middle", margin: 0 });
    s.addText(ko, { x: x + 0.8, y: cy + 0.48, w: cw - 0.9, h: 0.28, fontFace: BF, fontSize: 10.5, color: "EAF7F4", valign: "middle", margin: 0 });
    let iy = cy + 1.06;
    items.forEach((t) => {
      s.addShape(pres.shapes.OVAL, { x: x + 0.24, y: iy + 0.08, w: 0.11, h: 0.11, fill: { color: col } });
      s.addText(t, { x: x + 0.46, y: iy - 0.02, w: cw - 0.66, h: 0.7, fontFace: BF, fontSize: 11, color: C.ink, lineSpacingMultiple: 1.05, valign: "top", margin: 0 });
      iy += (t.length > 15 ? 0.78 : 0.55);
    });
  });
})();

// ===================================================================
// 3.6 [거시] 시장 규모 TAM-SAM-SOM
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Market · Macro", "시장 규모 (TAM–SAM–SOM) — 검증된 공식 자료만으로");
  const fx = M, fw = 6.3, fy = 1.85;
  const tiers = [
    ["TAM", "ASEAN-6 EV 생태계", "$100B~$120B (2035, EY-Parthenon)", C.tealDk, fw],
    ["SAM", "동남아 EV 충전 서비스", "EV 신차 점유율 9% · 판매 +50% (IEA 2025)", C.teal, fw * 0.74],
    ["SOM", "라오스 충전 · 슈퍼앱", "라오스 EV 40% 커버 (3년, LOCA 벤치마크)", C.amber, fw * 0.5],
  ];
  s.addText("ASEAN-6 → 라오스로 좁혀 본 실현 가능 시장", { x: fx, y: fy - 0.05, w: fw, h: 0.4, fontFace: BF, fontSize: 12.5, bold: true, color: C.muted, margin: 0 });
  let yy = fy + 0.5;
  tiers.forEach(([t, n, d, col, ww]) => {
    const x = fx + (fw - ww) / 2;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: yy, w: ww, h: 1.18, rectRadius: 0.06, fill: { color: col }, shadow: sh({ opacity: 0.12 }) });
    s.addText([
      { text: t + "  ", options: { bold: true, fontSize: 16, color: C.white } },
      { text: n, options: { fontSize: 12.5, color: "EAF7F4" } },
    ], { x: x + 0.2, y: yy + 0.14, w: ww - 0.4, h: 0.45, fontFace: HF, valign: "middle", align: "center", margin: 0 });
    s.addText(d, { x: x + 0.2, y: yy + 0.6, w: ww - 0.4, h: 0.5, fontFace: BF, fontSize: 10.5, color: "EAF7F4", align: "center", valign: "top", lineSpacingMultiple: 1.0, margin: 0 });
    yy += 1.4;
  });

  // right: market entry rationale (macro)
  const rx = fx + fw + 0.35, rw = W - M - rx;
  card(s, rx, fy, rw, 4.55, C.dark, false);
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: fy, w: 0.14, h: 4.55, fill: { color: C.amber } });
  s.addText("왜 지금인가 — 진입 논거", { x: rx + 0.4, y: fy + 0.22, w: rw - 0.7, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: C.white, margin: 0 });
  const concl = [
    "골든타임 — 충전소(40→100개소)와 EV(+111% YoY)가 동시에 늘어나는 12~18개월.",
    "LOCA 모델 검증 — 40개소 운영·1년 내 투자금 회수로 라오스 충전 사업성 입증.",
    "비엔티안·사반나켓 양대 거점 — 가구 18.8/18.6만 집중, SOM 1차 타깃.",
    "Grab×BYD·GAC 7만 대 ASEAN 진출 = EV 라이드헤일링 시장이 실재한다는 증거.",
  ];
  let cy2 = fy + 0.72;
  concl.forEach((t) => {
    s.addShape(pres.shapes.OVAL, { x: rx + 0.4, y: cy2 + 0.05, w: 0.16, h: 0.16, fill: { color: C.amber } });
    s.addText(t, { x: rx + 0.7, y: cy2 - 0.05, w: rw - 1.0, h: 0.95, fontFace: BF, fontSize: 12, color: C.white, lineSpacingMultiple: 1.12, valign: "top", margin: 0 });
    cy2 += 0.9;
  });
  s.addText("⚠ 데이터 신뢰도 원칙: 시장조사업체 추정치는 검증 실패로 전량 제외. IEA·EY-Parthenon·기업 공식 발표만 인용.", {
    x: rx + 0.4, y: fy + 4.0, w: rw - 0.7, h: 0.5, fontFace: BF, fontSize: 9.5, italic: true, color: "8FB3AE", lineSpacingMultiple: 1.05, valign: "top", margin: 0,
  });
})();

// ===================================================================
// 3.7 [거시] 경쟁사 분석 ① — EV 충전 앱
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Market · Competitors", "경쟁사 분석 ① — 동남아 EV 충전 앱 (직접 경쟁)");
  const heads = ["앱", "국가", "별점", "Negative", "리뷰수(인지도)", "강점 · 약점"];
  const colWd = [1.9, 1.5, 1.0, 1.2, 1.6];
  colWd.push(W - 2 * M - colWd.reduce((a, b) => a + b, 0));
  const tx = M, ty = 1.82;
  const tw = W - 2 * M;
  const colX = [tx];
  colWd.forEach((w, i) => { if (i < colWd.length - 1) colX.push(colX[i] + w); });
  // [app, country, star, neg, reviews, strength, weakness, hi]
  const rows = [
    ["LOCA EV", "라오스", "5.0⭐", "14.3%", "7건", "현지 1위 · LOCA 택시 연동", "리뷰 거의 없음 (현지 문화)", "laos"],
    ["PTT blueplus+", "태국", "3.11⭐", "47.6%", "1,518건", "앱+카드 이중결제 · 주유소 연계", "태국 외 미확장", "bench"],
    ["Green SM", "라오스·베트남", "2.56⭐", "53.5%", "26,603건", "리뷰 수 1위 · 인지도 최고", "UX·결제 오류 빈발", "laos"],
    ["PEA VOLTA", "태국", "2.28⭐", "67.9%", "499건", "태국 정부(PEA) 운영", "동남아 최하위 평점", ""],
    ["EleXA", "태국", "2.41⭐", "62.4%", "263건", "EGAT 국영 전기공사", "앱오류 · UI 심각", ""],
  ];
  // header
  s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ty, w: tw, h: 0.5, fill: { color: C.dark } });
  heads.forEach((h, i) => s.addText(h, { x: colX[i] + 0.1, y: ty, w: colWd[i] - 0.18, h: 0.5, fontFace: HF, fontSize: 11.5, bold: true, color: i === 0 ? C.tealLt : C.white, valign: "middle", align: i === 0 || i === 5 ? "left" : "center", margin: 0 }));
  let ry = ty + 0.5;
  const rh = 0.74;
  rows.forEach((r, i) => {
    const bg = r[7] === "bench" ? "FDF3E2" : (i % 2 ? "EAF1EF" : C.white);
    s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ry, w: tw, h: rh, fill: { color: bg }, line: { color: C.line, width: 0.75 } });
    if (r[7] === "bench") s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ry, w: 0.08, h: rh, fill: { color: C.amber } });
    s.addText([{ text: r[0], options: { bold: true, color: C.ink } }, ...(r[7] === "bench" ? [{ text: "  ★벤치마크", options: { color: C.amberDk, fontSize: 9, bold: true } }] : (r[7] === "laos" ? [{ text: "  ●라오스", options: { color: C.teal, fontSize: 9, bold: true } }] : []))],
      { x: colX[0] + 0.14, y: ry, w: colWd[0] - 0.18, h: rh, fontFace: BF, fontSize: 11.5, valign: "middle", margin: 0 });
    s.addText(r[1], { x: colX[1], y: ry, w: colWd[1], h: rh, fontFace: BF, fontSize: 10.5, color: C.muted, valign: "middle", align: "center", margin: 0 });
    s.addText(r[2], { x: colX[2], y: ry, w: colWd[2], h: rh, fontFace: HF, fontSize: 13, bold: true, color: r[7] === "bench" ? C.amberDk : C.tealDk, valign: "middle", align: "center", margin: 0 });
    s.addText(r[3], { x: colX[3], y: ry, w: colWd[3], h: rh, fontFace: BF, fontSize: 11.5, color: C.red, valign: "middle", align: "center", margin: 0 });
    s.addText(r[4], { x: colX[4], y: ry, w: colWd[4], h: rh, fontFace: BF, fontSize: 11.5, bold: true, color: C.ink, valign: "middle", align: "center", margin: 0 });
    s.addText([{ text: "✓ " + r[5] + "\n", options: { color: C.tealDk } }, { text: "✗ " + r[6], options: { color: "9A6A6A" } }],
      { x: colX[5] + 0.12, y: ry, w: colWd[5] - 0.2, h: rh, fontFace: BF, fontSize: 10.5, valign: "middle", lineSpacingMultiple: 1.05, margin: 0 });
    ry += rh;
  });
  // bottom insight band
  card(s, M, ry + 0.12, tw, 1.0, C.dark, false);
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: ry + 0.12, w: 0.14, h: 1.0, fill: { color: C.amber } });
  s.addText([
    { text: "시사점  ", options: { bold: true, color: C.amber } },
    { text: "전체 평균 2점대 레드오션 — PTT(3.11⭐)가 유일한 벤치마크. 라오스 직접 경쟁은 LOCA EV·Green SM뿐.\n", options: { color: C.white } },
    { text: "⚠ 데이터 보강  ", options: { bold: true, color: C.tealLt } },
    { text: "점유율 정량(%)은 검증 자료 부재 → 리뷰수를 인지도 대용으로 사용. 공식 단가 수집: PTT 4.5~7.5฿·PEA 5.3~8.8฿·EleX 7.5฿·V-Green 3,858₫·LOCA 4,300₭/kWh.", options: { color: "C9DBD8" } },
  ], { x: M + 0.42, y: ry + 0.12, w: tw - 0.8, h: 1.0, fontFace: BF, fontSize: 11, valign: "middle", lineSpacingMultiple: 1.15, margin: 0 });
})();

// ===================================================================
// 3.8 [거시] 경쟁사 분석 ② — 모빌리티 슈퍼앱
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Market · Competitors", "경쟁사 분석 ② — 모빌리티 슈퍼앱 (간접 경쟁)");
  const heads = ["앱", "별점", "Negative", "Positive", "리뷰수", "EV 언급", "시사점"];
  const colWd = [2.15, 0.95, 1.1, 1.1, 1.15, 1.1];
  colWd.push(W - 2 * M - colWd.reduce((a, b) => a + b, 0));
  const tx = M, ty = 1.82, tw = W - 2 * M;
  const colX = [tx];
  colWd.forEach((w, i) => { if (i < colWd.length - 1) colX.push(colX[i] + w); });
  const rows = [
    ["LOCA Taxi", "3.43⭐", "37.1%", "40.9%", "447건", "72건", "EV가 이미 핵심 서비스 (언급 16.1%)", "bench"],
    ["Grab", "3.11⭐", "45.0%", "36.8%", "1,479건", "75건", "BYD·GAC 7만 대 EV 진출 (라오스 미포함)", ""],
    ["Gojek", "3.20⭐", "51.0%", "31.7%", "1,066건", "30건", "EV 공식 전략 미확인", ""],
    ["KOKKOK Move", "2.41⭐", "44.7%", "16.7%", "378건", "7건", "Positive 최저 · 배차 실패 44.9%", "ours"],
  ];
  s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ty, w: tw, h: 0.5, fill: { color: C.dark } });
  heads.forEach((h, i) => s.addText(h, { x: colX[i] + 0.1, y: ty, w: colWd[i] - 0.18, h: 0.5, fontFace: HF, fontSize: 11.5, bold: true, color: i === 0 ? C.tealLt : C.white, valign: "middle", align: i === 0 || i === 6 ? "left" : "center", margin: 0 }));
  let ry = ty + 0.5;
  const rh = 0.72;
  rows.forEach((r, i) => {
    const bg = r[7] === "bench" ? "E7F5F2" : (r[7] === "ours" ? "FDF3E2" : (i % 2 ? "EAF1EF" : C.white));
    s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ry, w: tw, h: rh, fill: { color: bg }, line: { color: C.line, width: 0.75 } });
    if (r[7] === "bench" || r[7] === "ours") s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ry, w: 0.08, h: rh, fill: { color: r[7] === "bench" ? C.teal : C.amber } });
    s.addText([{ text: r[0], options: { bold: true, color: C.ink } }, ...(r[7] === "bench" ? [{ text: "  ★벤치마크", options: { color: C.tealDk, fontSize: 9, bold: true } }] : (r[7] === "ours" ? [{ text: "  ◆우리", options: { color: C.amberDk, fontSize: 9, bold: true } }] : []))],
      { x: colX[0] + 0.14, y: ry, w: colWd[0] - 0.18, h: rh, fontFace: BF, fontSize: 11.5, valign: "middle", margin: 0 });
    s.addText(r[1], { x: colX[1], y: ry, w: colWd[1], h: rh, fontFace: HF, fontSize: 12.5, bold: true, color: C.tealDk, valign: "middle", align: "center", margin: 0 });
    s.addText(r[2], { x: colX[2], y: ry, w: colWd[2], h: rh, fontFace: BF, fontSize: 11, color: C.red, valign: "middle", align: "center", margin: 0 });
    s.addText(r[3], { x: colX[3], y: ry, w: colWd[3], h: rh, fontFace: BF, fontSize: 11, color: C.tealDk, valign: "middle", align: "center", margin: 0 });
    s.addText(r[4], { x: colX[4], y: ry, w: colWd[4], h: rh, fontFace: BF, fontSize: 11, color: C.ink, valign: "middle", align: "center", margin: 0 });
    s.addText(r[5], { x: colX[5], y: ry, w: colWd[5], h: rh, fontFace: BF, fontSize: 11, bold: true, color: C.ink, valign: "middle", align: "center", margin: 0 });
    s.addText(r[6], { x: colX[6] + 0.12, y: ry, w: colWd[6] - 0.2, h: rh, fontFace: BF, fontSize: 10.5, color: C.muted, valign: "middle", lineSpacingMultiple: 1.05, margin: 0 });
    ry += rh;
  });
  // bottom insight band
  card(s, M, ry + 0.14, tw, 1.55, C.dark, false);
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: ry + 0.14, w: 0.14, h: 1.55, fill: { color: C.amber } });
  const pts = [
    ["LOCA 모델 검증", "택시앱 → EV 추가 → 라오스 1위·1년 내 투자금 회수 (LOCA Taxi EV 언급 16.1%)"],
    ["Grab 위협 ↔ 기회", "BYD·GAC 7만 대 ASEAN 진출 — 단 라오스는 미포함 = 선점 기회"],
    ["KOKKOK Move 과제", "EV 통합 전 드라이버 공급(배차 실패 44.9%)·기본기 개선이 선행 과제"],
  ];
  let py = ry + 0.3;
  pts.forEach(([h, d]) => {
    s.addShape(pres.shapes.OVAL, { x: M + 0.42, y: py + 0.04, w: 0.14, h: 0.14, fill: { color: C.amber } });
    s.addText([{ text: h + " — ", options: { bold: true, color: C.tealLt } }, { text: d, options: { color: C.white } }],
      { x: M + 0.66, y: py - 0.04, w: tw - 1.1, h: 0.4, fontFace: BF, fontSize: 11.5, valign: "middle", margin: 0 });
    py += 0.42;
  });
})();

// ===================================================================
// 3.9 [거시] 경쟁사 분석 ③ — 라오스 현지 뉴스 점유율 (진짜 경쟁자 찾기)
// ===================================================================
chartSlide("Market · Competitors", "경쟁사 분석 ③ — 라오스 현지 뉴스 점유율로 찾은 진짜 경쟁자",
  "19_laos_share_of_voice.png", [1156, 599],
  "임원진 벤치마크 LOCA는 데이터로 검증됐다.\n단, VinFast·Xanh SM이 뉴스 점유율 1위로 진입 중 — 놓쳤던 경쟁자다.",
  [
    "라오스 EV·모빌리티 뉴스 393건 — VinFast·Xanh SM 21 > LOCA 17 > KOKKOK Move 3 · Grab 0.",
    "Xanh SM=베트남발 EV 라이드헤일링(AVILA 협약·VF3/VF5 출시) → 2번째 벤치마크 축.",
    "Grab 미진출=경쟁군 축소 · KOKKOK Move 인지도 약세 → 차별화·마케팅 선결.",
  ]);

divider("1", "02", "문제 정의", "Problem Definition", "‘데이터로 근거를’ — 무엇을 풀 것인가");

// ===================================================================
// 4. 문제 정의
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Problem", "왜 EV 충전인가 — 골든타임의 라오스 시장");
  // top stat strip
  const stats = [
    ["4,437대", "라오스 EV 누적 수입\n(2024.10, +111% YoY)", C.teal],
    ["40 → 100개소", "LOCA EV 충전소\n2024년 말 → 2026 목표", C.amber],
    ["2.56점", "동남아 충전앱 평균 별점\n/ 5점 (Negative 53.5%)", C.red],
    ["12~18개월", "Kokkok EV\n시장 진입 골든타임", C.tealDk],
  ];
  const sw = 2.95, sg = 0.2, sx0 = (W - (4 * sw + 3 * sg)) / 2, sy = 1.72;
  stats.forEach(([num, lab, col], i) => {
    const x = sx0 + i * (sw + sg);
    card(s, x, sy, sw, 1.96);
    s.addShape(pres.shapes.RECTANGLE, { x, y: sy, w: sw, h: 0.1, fill: { color: col } });
    s.addText(num, { x: x + 0.1, y: sy + 0.32, w: sw - 0.2, h: 0.7, fontFace: HF, fontSize: 28, bold: true, color: col, align: "center", valign: "middle", margin: 0 });
    s.addText(lab, { x: x + 0.12, y: sy + 1.04, w: sw - 0.24, h: 0.85, fontFace: BF, fontSize: 11, color: C.muted, align: "center", valign: "top", lineSpacingMultiple: 1.1, margin: 0 });
  });
  // insight band
  card(s, M, 4.05, W - 2 * M, 2.3, C.dark, false);
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: 4.05, w: 0.16, h: 2.3, fill: { color: C.amber } });
  s.addText("핵심 가설", { x: M + 0.45, y: 4.28, w: 4, h: 0.35, fontFace: BF, fontSize: 12, bold: true, color: C.tealLt, charSpacing: 2, margin: 0 });
  s.addText([
    { text: "“EV는 빠르게 들어오는데 충전 경험은 별점 2.56점.\n", options: { color: C.white, bold: true } },
    { text: "충전앱 불만(앱 불안정 27.6%)은 ", options: { color: C.tealLt } },
    { text: "위협이 아니라 기회", options: { color: C.amber, bold: true } },
    { text: " — 3점대 서비스만 만들어도 동남아 2위권 진입이 가능하다.”", options: { color: C.tealLt } },
  ], { x: M + 0.45, y: 4.68, w: W - 2 * M - 0.9, h: 1.5, fontFace: HF, fontSize: 19, italic: true, lineSpacingMultiple: 1.2, valign: "top", margin: 0 });
})();

divider("2", "03", "데이터 수집·분석", "Data Collection & Analysis", "멀티채널 VOC 39,700+건의 정량 분석");

// ===================================================================
// 5. 접근 방식 — 멀티채널 수집 아키텍처
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Approach", "데이터 아키텍처 — 멀티채널 수집에서 기획까지");
  // pipeline columns
  const cols = [
    ["수집 SOURCE", C.teal, ["앱스토어 리뷰 (Google Play)", "유튜브 영상·댓글·자막(STT)", "네이버 블로그 / 뉴스", "Google News RSS", "충전기 하드웨어 뉴스"]],
    ["저장 STORE", C.tealDk, ["PostgreSQL / Supabase Cloud", "VOC 테이블 6개", "Market Intel 테이블 1개", "Session Pooler (Singapore)", "총 7개 테이블 · FK 설계"]],
    ["전처리 PROCESS", C.amber, ["언어 감지 (langdetect)", "감성 분석 (XLM-RoBERTa)", "번역 없이 100개 언어 직접", "키워드 카테고리 분류", "선택적 번역 (필요 시만)"]],
    ["분석·기획 OUTPUT", C.amberDk, ["감성·불만 카테고리 정량화", "포지셔닝 맵 · 경쟁 분석", "PRD 11개 기능 명세", "시장조사 · 요금정책", "Flowchart · Tableau"]],
  ];
  const cw = 2.92, gap = 0.22, x0 = (W - (4 * cw + 3 * gap)) / 2, cy = 1.78, ch = 4.45;
  cols.forEach(([title, col, items], i) => {
    const x = x0 + i * (cw + gap);
    card(s, x, cy, cw, ch);
    s.addShape(pres.shapes.RECTANGLE, { x, y: cy, w: cw, h: 0.62, fill: { color: col } });
    s.addText(title, { x: x + 0.1, y: cy, w: cw - 0.2, h: 0.62, fontFace: HF, fontSize: 14.5, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    s.addText(items.map((t, j) => ({ text: t, options: { bullet: { code: "2022", indent: 12 }, breakLine: true, paraSpaceAfter: 7 } })),
      { x: x + 0.22, y: cy + 0.82, w: cw - 0.4, h: ch - 1.0, fontFace: BF, fontSize: 11.5, color: C.ink, valign: "top", margin: 0 });
    if (i < 3) s.addText("→", { x: x + cw - 0.04, y: cy + ch / 2 - 0.3, w: gap + 0.08, h: 0.6, fontFace: HF, fontSize: 22, bold: true, color: C.amber, align: "center", valign: "middle", margin: 0 });
  });
  s.addText([
    { text: "설계 원칙  ", options: { bold: true, color: C.teal } },
    { text: "VOC(‘무엇이 불편한가’)와 Market Intel(‘시장이 어떻게 움직이는가’)은 목적이 달라 테이블부터 분리 설계했습니다.", options: { color: C.muted } },
  ], { x: M, y: 6.32, w: W - 2 * M, h: 0.35, fontFace: BF, fontSize: 12, align: "center", margin: 0 });
})();

// ===================================================================
// 6. 데이터 수집 현황
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Collection", "수집 현황 — 39,700+ 건의 멀티채널 데이터");
  // table left
  const rows = [
    ["app_reviews", "28,890건", "VOC 핵심", C.teal],
    ["superapp_reviews", "3,370건", "슈퍼앱 경쟁분석", C.teal],
    ["youtube_stt", "2,625세그", "실사용 맥락", C.teal],
    ["news_articles", "2,483건", "시장·HW 인텔", C.amber],
    ["youtube_comments", "527건", "사용자 반응", C.teal],
    ["blog_posts", "42건", "한국인 시각", C.muted],
  ];
  const tx = M, ty = 1.78, tw = 6.5;
  card(s, tx, ty, tw, 4.6, C.card);
  s.addText("수집 데이터 테이블", { x: tx + 0.3, y: ty + 0.18, w: tw - 0.6, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: C.ink, margin: 0 });
  let ry = ty + 0.75;
  const rh = 0.6;
  rows.forEach(([name, cnt, use, col], i) => {
    if (i % 2 === 1) s.addShape(pres.shapes.RECTANGLE, { x: tx + 0.2, y: ry - 0.04, w: tw - 0.4, h: rh, fill: { color: "F0F5F4" } });
    s.addShape(pres.shapes.RECTANGLE, { x: tx + 0.3, y: ry + 0.07, w: 0.1, h: rh - 0.22, fill: { color: col } });
    s.addText(name, { x: tx + 0.52, y: ry, w: 2.6, h: rh, fontFace: "Consolas", fontSize: 12, bold: true, color: C.ink, valign: "middle", margin: 0 });
    s.addText(cnt, { x: tx + 3.1, y: ry, w: 1.7, h: rh, fontFace: HF, fontSize: 14, bold: true, color: col, valign: "middle", align: "right", margin: 0 });
    s.addText(use, { x: tx + 4.95, y: ry, w: 1.45, h: rh, fontFace: BF, fontSize: 10.5, color: C.muted, valign: "middle", align: "right", margin: 0 });
    ry += rh;
  });

  // right narrative — trial & error
  const rx = tx + tw + 0.3, rw = W - M - rx;
  card(s, rx, ty, rw, 4.6, C.dark, false);
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: ty, w: 0.14, h: 4.6, fill: { color: C.amber } });
  s.addText("수집 단계에서 부딪힌 현실", { x: rx + 0.4, y: ty + 0.2, w: rw - 0.7, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: C.white, margin: 0 });
  const te = [
    ["LOCA EV 리뷰 단 7건", "라오스는 리뷰 문화 부재 → 태국 선도 3개 앱을 비교군으로 추가"],
    ["Green SM = V-Green 동일 앱", "앱 ID(com.gsm.customer) 일치 확인 → country='MUL' 통합 처리"],
    ["Google Play 2,000건 제한", "언어·국가 5개 조합으로 분할 수집 → Green SM만 26,603건 확보"],
    ["뉴스·하드웨어 추가 설계", "충전앱 ‘앱 불안정’ 원인 가설 검증 위해 HW 뉴스 1,327건 추가"],
  ];
  let ey = ty + 0.78;
  te.forEach(([h, d]) => {
    s.addText("✦", { x: rx + 0.4, y: ey, w: 0.35, h: 0.3, fontFace: BF, fontSize: 13, bold: true, color: C.amber, margin: 0 });
    s.addText([
      { text: h + "\n", options: { bold: true, color: C.tealLt, fontSize: 12.5 } },
      { text: d, options: { color: "C9DBD8", fontSize: 11 } },
    ], { x: rx + 0.78, y: ey - 0.02, w: rw - 1.1, h: 0.92, fontFace: BF, lineSpacingMultiple: 1.08, valign: "top", margin: 0 });
    ey += 0.95;
  });
})();

// ===================================================================
// 7. 전처리 파이프라인 (엔지니어링 역량)
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Pipeline", "다국어 전처리 — 번역 없이 100개 언어를 직접 분석");
  // left: key decision with before/after time-bar comparison
  const bx = M, by = 1.78, bw = 6.5;
  card(s, bx, by, bw, 4.6);
  s.addText("핵심 의사결정 — 번역 전략 전면 수정", { x: bx + 0.35, y: by + 0.18, w: bw - 0.7, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: C.ink, margin: 0 });
  s.addText("리뷰 28,890건 처리 시간 비교", { x: bx + 0.35, y: by + 0.6, w: bw - 0.7, h: 0.3, fontFace: BF, fontSize: 11.5, bold: true, color: C.muted, charSpacing: 1, margin: 0 });

  const barX = bx + 0.35, sc = 3.8 / 12; // 12h -> 3.8"
  // Row 1 — before (12h)
  s.addText([{ text: "✕  변경 전", options: { bold: true, color: C.red } }, { text: "   전체 영어 번역 후 분석 (googletrans)", options: { color: "8A4A4A" } }],
    { x: barX, y: by + 1.0, w: bw - 0.7, h: 0.3, fontFace: BF, fontSize: 12, margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: barX, y: by + 1.4, w: 12 * sc, h: 0.42, fill: { color: C.red } });
  s.addText("약 12시간", { x: barX + 0.12, y: by + 1.4, w: 2, h: 0.42, fontFace: BF, fontSize: 12, bold: true, color: "FFFFFF", valign: "middle", margin: 0 });
  s.addText("600건 처리 후 강제 종료 — 사실상 불가능", { x: barX, y: by + 1.88, w: 4.2, h: 0.28, fontFace: BF, fontSize: 10.5, color: C.muted, margin: 0 });
  // Row 2 — after (2h)
  s.addText([{ text: "✓  변경 후", options: { bold: true, color: C.tealDk } }, { text: "   XLM-RoBERTa 다국어 직접 분석", options: { color: "2C5A52" } }],
    { x: barX, y: by + 2.42, w: bw - 0.7, h: 0.3, fontFace: BF, fontSize: 12, margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: barX, y: by + 2.82, w: 2 * sc, h: 0.42, fill: { color: C.teal } });
  s.addText("2시간", { x: barX + 2 * sc + 0.14, y: by + 2.82, w: 2, h: 0.42, fontFace: BF, fontSize: 12, bold: true, color: C.tealDk, valign: "middle", margin: 0 });
  s.addText("전량 28,890건 처리 · 번역 없이 정확도 향상", { x: barX, y: by + 3.3, w: 4.4, h: 0.28, fontFace: BF, fontSize: 10.5, color: C.muted, margin: 0 });
  // 6x badge
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx + bw - 1.78, y: by + 1.45, w: 1.4, h: 1.32, rectRadius: 0.1, fill: { color: C.dark } });
  s.addText([{ text: "6×\n", options: { fontSize: 26, bold: true, color: C.amber } }, { text: "처리 시간 단축", options: { fontSize: 9.5, color: C.tealLt } }],
    { x: bx + bw - 1.78, y: by + 1.45, w: 1.4, h: 1.32, fontFace: HF, align: "center", valign: "middle", lineSpacingMultiple: 0.95, margin: 0 });
  // multilingual example
  s.addShape(pres.shapes.LINE, { x: barX, y: by + 3.78, w: bw - 0.7, h: 0, line: { color: C.line, width: 1 } });
  s.addText("결제 오류 · Ứng dụng lỗi · ดีมากชาร์จเร็ว · ແອັບດີ", { x: barX, y: by + 3.92, w: bw - 0.7, h: 0.32, fontFace: BF, fontSize: 12, italic: true, color: C.tealDk, margin: 0 });
  s.addText("→ 한·영·베·태·라오어를 번역 없이 각 언어로 직접 감성 분류", { x: barX, y: by + 4.24, w: bw - 0.7, h: 0.3, fontFace: BF, fontSize: 10.5, color: C.muted, margin: 0 });

  // right: engineering challenges
  const rx = bx + bw + 0.3, rw = W - M - rx;
  const items = [
    ["Supabase 리전 불일치", "Seoul pooler로 접속 실패 → Singapore Session Pooler(5432·IPv4)로 전환"],
    ["10초 statement timeout", "대용량 UPDATE 불가 → 200건 배치 처리로 분할 실행"],
    ["분석을 DB→Python 전환", "SELECT로 로드 후 pandas·matplotlib에서 집계·시각화"],
    ["라이브러리 버전 변경 대응", "youtube-transcript-api 클래스→인스턴스 메서드 (api.list)"],
  ];
  card(s, rx, by, rw, 4.6, C.dark, false);
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: by, w: 0.14, h: 4.6, fill: { color: C.teal } });
  s.addText("엔지니어링 트러블슈팅", { x: rx + 0.4, y: by + 0.2, w: rw - 0.7, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: C.white, margin: 0 });
  let iy = by + 0.82;
  items.forEach(([h, d]) => {
    s.addText("›", { x: rx + 0.4, y: iy - 0.02, w: 0.3, h: 0.3, fontFace: HF, fontSize: 15, bold: true, color: C.amber, margin: 0 });
    s.addText([
      { text: h + "\n", options: { bold: true, color: C.tealLt, fontSize: 12.5 } },
      { text: d, options: { color: "C9DBD8", fontSize: 11 } },
    ], { x: rx + 0.74, y: iy - 0.02, w: rw - 1.05, h: 0.92, fontFace: BF, lineSpacingMultiple: 1.08, valign: "top", margin: 0 });
    iy += 0.95;
  });
})();

// ===================================================================
// Chart slide helper
// ===================================================================
function chartSlide(kicker, title, img, imgWH, punch, takeaways) {
  const s = pres.addSlide();
  chrome(s, kicker, title);
  const [iw, ih] = imgWH;
  // image area left
  const maxW = 8.0, maxH = 4.55;
  const ratio = iw / ih;
  let dw = maxW, dh = dw / ratio;
  if (dh > maxH) { dh = maxH; dw = dh * ratio; }
  const ix = M + (maxW - dw) / 2 + 0.1, iy = 1.78 + (maxH - dh) / 2 + 0.15;
  card(s, M, 1.78, maxW + 0.2, 4.7, C.white);
  s.addImage({ path: ASSET(img), x: ix, y: iy, w: dw, h: dh });
  // right panel
  const rx = M + maxW + 0.45, rw = W - M - rx;
  card(s, rx, 1.78, rw, 4.7, C.dark, false);
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: 1.78, w: 0.14, h: 4.7, fill: { color: C.amber } });
  // 핵심 메시지 (so-what)
  s.addText("핵심 메시지", { x: rx + 0.42, y: 1.96, w: rw - 0.7, h: 0.3, fontFace: BF, fontSize: 11.5, bold: true, color: C.amber, charSpacing: 2, margin: 0 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx + 0.42, y: 2.28, w: rw - 0.84, h: 1.66, rectRadius: 0.06, fill: { color: C.dark2 } });
  s.addText(punch, { x: rx + 0.62, y: 2.34, w: rw - 1.24, h: 1.54, fontFace: HF, fontSize: 14, bold: true, color: C.white, lineSpacingMultiple: 1.16, valign: "middle", margin: 0 });
  // 근거
  s.addText("근거", { x: rx + 0.42, y: 4.04, w: rw - 0.7, h: 0.3, fontFace: BF, fontSize: 11.5, bold: true, color: C.tealLt, charSpacing: 2, margin: 0 });
  let ty = 4.4;
  takeaways.forEach((t) => {
    const lines = Math.min(2, Math.max(1, Math.ceil(t.length / 22)));
    s.addShape(pres.shapes.OVAL, { x: rx + 0.42, y: ty + 0.04, w: 0.13, h: 0.13, fill: { color: C.amber } });
    s.addText(t, { x: rx + 0.68, y: ty - 0.05, w: rw - 1.0, h: lines * 0.28 + 0.1, fontFace: BF, fontSize: 11, color: "C9DBD8", lineSpacingMultiple: 1.06, valign: "top", margin: 0 });
    ty += 0.25 * lines + 0.11;
  });
  return s;
}

// ---------- appendix: deliverable artifact slide ----------
function artifactSlide(d) {
  const s = pres.addSlide();
  const kicker = d.stage === "기획" ? "Appendix · 기획 산출물" : "Appendix · 설계 산출물";
  chrome(s, kicker, d.name);

  const img = DELIV(d.file);
  const dims = img ? imgDims(img) : null;
  const tall = dims && dims.r < 0.85;          // portrait / very tall artifact
  const iy = 1.8, ih = 4.7;
  const iw = tall ? 4.5 : 8.1;                 // narrower frame for tall images
  const ix = M;

  // left: artifact image (or placeholder)
  card(s, ix, iy, iw, ih, C.white);
  if (img) {
    const pad = 0.2;
    s.addImage({ path: img, x: ix + pad, y: iy + pad, w: iw - 2 * pad, h: ih - 2 * pad, sizing: { type: "contain", w: iw - 2 * pad, h: ih - 2 * pad } });
  } else {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ix + 0.35, y: iy + 0.4, w: iw - 0.7, h: ih - 0.8, rectRadius: 0.08, fill: { color: "EEF3F2" }, line: { color: C.teal, width: 1.5, dashType: "dash" } });
    s.addShape(pres.shapes.OVAL, { x: ix + iw / 2 - 0.45, y: iy + 1.15, w: 0.9, h: 0.9, fill: { color: "FFFFFF" }, line: { color: C.teal, width: 1.5 } });
    s.addText("+", { x: ix + iw / 2 - 0.45, y: iy + 1.1, w: 0.9, h: 0.9, fontFace: HF, fontSize: 40, bold: true, color: C.teal, align: "center", valign: "middle", margin: 0 });
    s.addText(d.name, { x: ix + 0.4, y: iy + 2.35, w: iw - 0.8, h: 0.4, fontFace: BF, fontSize: 15, bold: true, color: C.ink, align: "center", valign: "middle", margin: 0 });
    s.addText("화면 캡처 영역 — 파일 전달 후 삽입", { x: ix + 0.4, y: iy + 2.78, w: iw - 0.8, h: 0.34, fontFace: BF, fontSize: 12, color: C.muted, align: "center", valign: "middle", margin: 0 });
    s.addText("assets/deliverables/" + d.file + ".png", { x: ix + 0.4, y: iy + 3.14, w: iw - 0.8, h: 0.32, fontFace: BF, fontSize: 10.5, italic: true, color: C.teal, align: "center", valign: "middle", margin: 0 });
  }

  // right: description panel (widens when the image frame is narrow)
  const rx = ix + iw + 0.35, rw = W - M - rx;
  card(s, rx, iy, rw, ih, C.dark, false);
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: iy, w: 0.14, h: ih, fill: { color: d.color } });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx + 0.42, y: iy + 0.32, w: 1.5, h: 0.45, rectRadius: 0.08, fill: { color: d.color } });
  s.addText(d.stage + " 단계", { x: rx + 0.42, y: iy + 0.32, w: 1.5, h: 0.45, fontFace: BF, fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  s.addText("무엇인가", { x: rx + 0.42, y: iy + 1.05, w: rw - 0.7, h: 0.32, fontFace: BF, fontSize: 11.5, bold: true, color: C.tealLt, charSpacing: 1, margin: 0 });
  s.addText(d.desc, { x: rx + 0.42, y: iy + 1.4, w: rw - 0.75, h: 1.35, fontFace: BF, fontSize: 13, color: C.white, lineSpacingMultiple: 1.2, valign: "top", margin: 0 });
  s.addShape(pres.shapes.LINE, { x: rx + 0.42, y: iy + 2.82, w: rw - 0.8, h: 0, line: { color: C.dark2, width: 1.2 } });
  s.addText("역할 · 근거", { x: rx + 0.42, y: iy + 2.96, w: rw - 0.7, h: 0.32, fontFace: BF, fontSize: 11.5, bold: true, color: C.amber, charSpacing: 1, margin: 0 });
  s.addText(d.role, { x: rx + 0.42, y: iy + 3.31, w: rw - 0.75, h: 1.05, fontFace: BF, fontSize: 12.5, color: "C9DBD8", lineSpacingMultiple: 1.2, valign: "top", margin: 0 });
  if (d.note) s.addText(d.note, { x: rx + 0.42, y: iy + ih - 0.62, w: rw - 0.75, h: 0.5, fontFace: BF, fontSize: 10, italic: true, color: "8FB3AE", lineSpacingMultiple: 1.05, valign: "top", margin: 0 });
}

// 8. 감성 분석
chartSlide("Insight · 01", "분석 ① 채널별 감성 분포 — 앱 UX가 가장 아프다",
  "02_sentiment_by_app.png", [1336, 734],
  "사용자 불만은 ‘앱스토어 리뷰’에 집중된다.\n앱 UX가 가장 시급한 개선 지점이다.",
  [
    "앱 리뷰 Negative 53.5% — 4개 채널 중 가장 부정적.",
    "PTT blueplus+만 47.6%로 평균 이하 → 벤치마크 후보.",
    "유튜브·뉴스는 중립·긍정 위주 → 불만은 ‘앱’에 집중.",
  ]);

// 9. 불만 카테고리
chartSlide("Insight · 02", "분석 ② 불만 구조 — 도메인을 나누니 진짜 문제가 보였다",
  "18_complaint_2layer.png", [1936, 787],
  "VOC의 92%는 충전이 아니라 라이드헤일링이었다.\n도메인을 분리하자 충전앱의 진짜 1위 ‘앱 불안정’이 드러났다.",
  [
    "부정 15,461건 — 라이드헤일링 42.4% · 앱공통 39.2% · 충전 전용 0.7%.",
    "Green SM(92%)=베트남 라이드헤일링 앱 → 충전 VOC로 오인됐던 것.",
    "→ 도메인 분리 재분류로 ‘기타’ 50%→16.6%, 충전앱 레이어 분리.",
  ]);

// 10. 포지셔닝 맵
chartSlide("Insight · 03", "분석 ③ 경쟁 포지셔닝 — 비어 있는 ‘오른쪽 아래’",
  "10_app_positioning_map.png", [1486, 885],
  "지금 시장엔 ‘잘 만든 충전앱’이 없다.\nPTT(3.11점)만 넘어도 KOKKOK이 1위가 될 빈 자리다.",
  [
    "5개 앱 모두 별점 2.2~3.1·부정 우세 → 좌하단 밀집.",
    "PTT만 평균 우측이지만 3.11점에 불과 = 현재 1위.",
    "목표: 오른쪽 아래(고별점·저불만) 좌표를 선점.",
  ]);

// 11. 경쟁사 불만 비교
chartSlide("Insight · 04", "분석 ④ 충전앱 레이어 — 우리가 풀 문제",
  "11_app_competitive_analysis.png", [1415, 692],
  "충전앱(PTT·PEA·EleXA·LOCA)의 공통 약점은 명확하다.\n앱 안정성 + 온보딩(KYC) + 지갑결제, 세 축이다.",
  [
    "충전앱 부정 1,227건 — 앱 불안정 27.6% · 계정·인증·KYC 15.0% · 결제·지갑 11.0%.",
    "세 앱 공통으로 ‘앱 안정성·온보딩’이 상위 → 구조적 약점.",
    "→ 이 세 축이 우리 PRD P0~P1의 직접 근거.",
  ]);

// 12. 핵심 인사이트 — 가설을 데이터로 뒤집다
chartSlide("Key Insight", "핵심 인사이트 — 가설을 데이터로 뒤집다",
  "17_app_hw_linkage.png", [1676, 733],
  "초기 가설은 ‘앱오류=OCPP 통신 문제’였다.\n도메인 분리로 다시 보니, 충전앱 #1은 앱 안정성·온보딩이었다.",
  [
    "충전앱 부정 #1 — 앱 불안정 27.6% · 계정·인증·KYC 15.0% · 결제 11.0%.",
    "OCPP·호환 뉴스 169건은 기술 표준 ‘요건’ — VOC상 직접 원인 근거는 약함.",
    "→ PRD P0를 ‘세션 안정성·간편 온보딩·지갑결제’로 재정렬.",
  ]);

// 13. 하드웨어 포지셔닝
chartSlide("Insight · HW", "하드웨어 이슈 맵 — 빈도 높고 심각한 문제 식별",
  "14_hw_positioning_map.png", [1478, 886],
  "하드웨어 우선순위는 둘이다.\n가장 많이 언급된 OCPP 호환, 가장 심각한 충전기 결함.",
  [
    "OCPP·호환문제 — 언급 최다(169건) → 표준 준수 최우선.",
    "충전기결함 — Negative 32%로 심각도 1위.",
    "→ HW P0: OCPP 검증 + 충전기 실시간 모니터링.",
  ]);

// ===================================================================
// 13.9 고객 페르소나
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Data · Persona", "고객 페르소나 — 데이터로 정의한 핵심 타겟");
  const ps = [
    {
      name: "EV 라이드헤일링 드라이버", tag: "핵심 타겟", col: C.amberDk,
      who: "쏨퐁 · 34세 · 비엔티안",
      quote: "“충전 한 번 실패하면 그날 수입이 날아가요.”",
      demo: ["라이드헤일링 생계 운전자", "하루 2~3회 충전 · 낮 시간대", "LOCA Taxi EV 언급 16.1%"],
      goals: ["빠른 충전 시작", "안정적 결제", "충전소 위치 즉시 확인"],
      pains: ["충전 실패(앱 불안정)로 영업 손실", "결제 오류 반복", "배차·충전 대기 시간"],
      src: "근거 · LOCA Taxi 447건 + 유튜브 자막",
    },
    {
      name: "외국인 여행자", tag: "성장 타겟", col: C.teal,
      who: "Emma · 28세 · 호주 배낭여행객",
      quote: "“해외 카드가 안 돼서 결제를 못 했어요.”",
      demo: ["2주 체류 · 렌트 EV/스쿠터", "영어 사용 · 해외 카드 보유", "영어 리뷰 Negative 65.8%"],
      goals: ["국제 카드 결제", "영어 UI 지원", "앱 없이 QR 1회 결제"],
      pains: ["해외 카드 미지원", "영어 UI 부재", "결제 매번 실패"],
      src: "근거 · 영어 리뷰 1,992건",
    },
    {
      name: "EV 차량 오너", tag: "초기·충성 타겟", col: C.tealDk,
      who: "분미 · 29세 · 비엔티안 직장인",
      quote: "“가까운 충전소가 어디 있는지를 모르겠어요.”",
      demo: ["비엔티안 거주 자차 충전", "라오스 EV 4,437대(+111%)", "15~39세 43.2% 젊은 얼리어답터"],
      goals: ["가까운 충전소 탐색", "충전 완료 알림", "충전기 예약"],
      pains: ["충전소 위치 정보 부족", "충전 속도 불만", "예약 기능 부재"],
      src: "근거 · 충전소위치·충전 불만 + LSB 연령구조",
    },
  ];
  const gap = 0.3, cw = (W - 2 * M - 2 * gap) / 3, x0 = M, cy = 1.74, ch = 5.0;
  const block = (s, x, y, w, label, col, items) => {
    s.addText(label, { x: x, y: y, w: w, h: 0.28, fontFace: BF, fontSize: 10.5, bold: true, color: col, charSpacing: 1, margin: 0 });
    s.addText(items.map((t) => ({ text: t, options: { bullet: { code: "2022", indent: 11 }, breakLine: true, paraSpaceAfter: 3 } })),
      { x: x + 0.04, y: y + 0.3, w: w, h: 1.0, fontFace: BF, fontSize: 10.5, color: C.ink, lineSpacingMultiple: 1.04, valign: "top", margin: 0 });
  };
  ps.forEach((p, i) => {
    const x = x0 + i * (cw + gap);
    card(s, x, cy, cw, ch);
    s.addShape(pres.shapes.RECTANGLE, { x, y: cy, w: cw, h: 0.74, fill: { color: p.col } });
    s.addText(p.name, { x: x + 0.24, y: cy + 0.06, w: cw - 0.45, h: 0.34, fontFace: HF, fontSize: 13.5, bold: true, color: C.white, valign: "middle", margin: 0 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.24, y: cy + 0.42, w: 1.35, h: 0.25, rectRadius: 0.05, fill: { color: "FFFFFF" } });
    s.addText(p.tag, { x: x + 0.24, y: cy + 0.42, w: 1.35, h: 0.25, fontFace: BF, fontSize: 9, bold: true, color: p.col, align: "center", valign: "middle", margin: 0 });
    s.addText(p.who, { x: x + 1.66, y: cy + 0.42, w: cw - 1.9, h: 0.25, fontFace: BF, fontSize: 9.5, color: "FFFFFF", valign: "middle", margin: 0 });
    s.addText(p.quote, { x: x + 0.24, y: cy + 0.8, w: cw - 0.46, h: 0.38, fontFace: BF, fontSize: 10, italic: true, color: p.col, valign: "middle", lineSpacingMultiple: 1.0, margin: 0 });
    block(s, x + 0.24, cy + 1.26, cw - 0.46, "인구통계 · 특성", p.col, p.demo);
    block(s, x + 0.24, cy + 2.4, cw - 0.46, "목표 (Goals)", C.tealDk, p.goals);
    block(s, x + 0.24, cy + 3.54, cw - 0.46, "좌절 요인 (Frustrations)", C.red, p.pains);
    s.addText(p.src, { x: x + 0.24, y: cy + ch - 0.3, w: cw - 0.46, h: 0.26, fontFace: BF, fontSize: 8.5, italic: true, color: C.muted, margin: 0 });
  });
})();

divider("3", "04", "제품 기획·설계", "Product Planning & Design", "인사이트를 11개 기능과 설계 산출물로");

// ===================================================================
// 13.5 제품 기획 단계 구조 (기획 → 설계 → 개발)
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Product · Lifecycle", "우리가 만든 것 — 기획에서 설계까지, 개발 직전 단계");

  const cols = [
    { no: "①", ko: "기획", en: "Discovery", sub: "무엇을 · 왜", color: C.teal, owned: true,
      items: ["시나리오", "스토리보드 (화면설계서)", "프로토타이핑"] },
    { no: "②", ko: "설계", en: "Design", sub: "어떻게 동작 · 구조", color: C.amberDk, owned: true,
      items: ["OCPP 1.6-J 데이터 명세서", "ERD", "DB 구조 설계", "알고리즘 시퀀스 다이어그램"] },
    { no: "③", ko: "개발", en: "Development", sub: "실제 구현", color: C.muted, owned: false,
      items: ["코드 구현 · API 개발", "DB 구축 · 운영", "OCPP 충전기 실연동", "통합 · 테스트 · 배포"] },
  ];
  const gap = 0.3, cw = (W - 2 * M - 2 * gap) / 3, x0 = M, cy = 2.62, ch = 3.4;

  // coverage banner over first two (owned) columns
  const covW = cw * 2 + gap;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x0, y: 1.82, w: covW, h: 0.56, rectRadius: 0.1, fill: { color: C.dark } });
  s.addText([
    { text: "✔  우리가 완성한 범위", options: { bold: true, color: C.amber } },
    { text: "    분석 → 기획 → 설계  (개발 즉시 착수 가능)", options: { color: C.tealLt } },
  ], { x: x0 + 0.3, y: 1.82, w: covW - 0.5, h: 0.56, fontFace: BF, fontSize: 13, valign: "middle", margin: 0 });
  // next-stage tag over dev column
  const devx = x0 + 2 * (cw + gap);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: devx, y: 1.82, w: cw, h: 0.56, rectRadius: 0.1, fill: { color: "E3E9E8" }, line: { color: C.muted, width: 1, dashType: "dash" } });
  s.addText("다음 단계 ▶", { x: devx, y: 1.82, w: cw, h: 0.56, fontFace: BF, fontSize: 12.5, bold: true, color: C.muted, align: "center", valign: "middle", margin: 0 });

  cols.forEach((c, i) => {
    const x = x0 + i * (cw + gap);
    const faded = !c.owned;
    card(s, x, cy, cw, ch, faded ? "F1F4F3" : C.card, !faded);
    if (faded) s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: cy, w: cw, h: ch, rectRadius: 0.08, fill: { color: "F1F4F3" }, line: { color: C.muted, width: 1, dashType: "dash" } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: cy, w: cw, h: 0.8, fill: { color: c.color } });
    s.addText([
      { text: c.no + "  ", options: { color: "FFFFFF" } },
      { text: c.ko, options: { bold: true, color: "FFFFFF" } },
    ], { x: x + 0.28, y: cy + 0.1, w: cw - 0.5, h: 0.42, fontFace: HF, fontSize: 18, valign: "middle", margin: 0 });
    s.addText(c.en + " · " + c.sub, { x: x + 0.28, y: cy + 0.5, w: cw - 0.5, h: 0.28, fontFace: BF, fontSize: 10.5, color: faded ? "EFEFEF" : "EAF7F4", valign: "middle", margin: 0 });
    let iy = cy + 1.02;
    c.items.forEach((it) => {
      s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: iy + 0.07, w: 0.14, h: 0.14, fill: { color: faded ? C.muted : c.color } });
      s.addText(it, { x: x + 0.56, y: iy - 0.04, w: cw - 0.76, h: 0.42, fontFace: BF, fontSize: 12.5, bold: !faded, color: faded ? C.muted : C.ink, valign: "middle", margin: 0 });
      iy += 0.52;
    });
    if (faded) s.addText("본 프로젝트 범위 외", { x: x + 0.28, y: cy + ch - 0.5, w: cw - 0.5, h: 0.35, fontFace: BF, fontSize: 11, italic: true, color: C.muted, margin: 0 });
    if (i < 2) s.addText("→", { x: x + cw - 0.04, y: cy + ch / 2 - 0.3, w: gap + 0.08, h: 0.6, fontFace: HF, fontSize: 22, bold: true, color: C.amber, align: "center", valign: "middle", margin: 0 });
  });

  // bottom takeaway
  card(s, M, 6.18, W - 2 * M, 0.6, C.dark, false);
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: 6.18, w: 0.14, h: 0.6, fill: { color: C.amber } });
  s.addText([
    { text: "핵심  ", options: { bold: true, color: C.amber } },
    { text: "데이터 분석에서 멈추지 않고, 개발이 즉시 착수 가능한 설계 산출물까지 완성했습니다. (산출물 상세 → 부록)", options: { color: C.white } },
  ], { x: M + 0.42, y: 6.18, w: W - 2 * M - 0.8, h: 0.6, fontFace: BF, fontSize: 12.5, valign: "middle", margin: 0 });
})();

// ===================================================================
// 13.7 기획·설계 산출물 3묶음
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Product · Artifacts", "기획·설계 — 산출물 3개 묶음으로 구체화");
  const groups = [
    { title: "통신 · 로직 설계", stage: "설계", color: C.amberDk, purpose: "앱 ↔ 충전기 통신과 충전 동작 로직을 정의",
      items: ["OCPP 1.6-J 데이터 명세서", "시퀀스 다이어그램", "알고리즘 Flow Chart"] },
    { title: "데이터 설계", stage: "설계", color: C.amber, purpose: "서비스·VOC 데이터 구조를 실행 가능한 스키마로",
      items: ["ERD (엔티티·관계 모델링)", "DB 구조 설계 (DDL)"] },
    { title: "UX · 화면 기획", stage: "기획", color: C.teal, purpose: "사용자 흐름과 화면을 검증 가능한 형태로",
      items: ["사용자 시나리오", "스토리보드 (화면설계서)", "프로토타이핑"] },
  ];
  const gap = 0.3, cw = (W - 2 * M - 2 * gap) / 3, x0 = M, cy = 1.9, ch = 4.25;
  groups.forEach((g, gi) => {
    const x = x0 + gi * (cw + gap);
    card(s, x, cy, cw, ch);
    s.addShape(pres.shapes.RECTANGLE, { x, y: cy, w: cw, h: 0.84, fill: { color: g.color } });
    s.addText(g.title, { x: x + 0.26, y: cy, w: cw - 1.3, h: 0.84, fontFace: HF, fontSize: 15.5, bold: true, color: C.white, valign: "middle", margin: 0 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + cw - 1.02, y: cy + 0.26, w: 0.78, h: 0.34, rectRadius: 0.08, fill: { color: "FFFFFF" } });
    s.addText(g.stage, { x: x + cw - 1.02, y: cy + 0.26, w: 0.78, h: 0.34, fontFace: BF, fontSize: 11, bold: true, color: g.color, align: "center", valign: "middle", margin: 0 });
    let iy = cy + 1.12;
    g.items.forEach((t, idx) => {
      s.addShape(pres.shapes.OVAL, { x: x + 0.26, y: iy, w: 0.4, h: 0.4, fill: { color: g.color } });
      s.addText(`${idx + 1}`, { x: x + 0.26, y: iy, w: 0.4, h: 0.4, fontFace: HF, fontSize: 14, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
      s.addText(t, { x: x + 0.78, y: iy - 0.04, w: cw - 1.0, h: 0.5, fontFace: BF, fontSize: 12.5, bold: true, color: C.ink, valign: "middle", lineSpacingMultiple: 1.0, margin: 0 });
      if (idx < g.items.length - 1) s.addShape(pres.shapes.LINE, { x: x + 0.46, y: iy + 0.42, w: 0, h: 0.36, line: { color: g.color, width: 1.5 } });
      iy += 0.78;
    });
    // purpose footer
    s.addShape(pres.shapes.LINE, { x: x + 0.26, y: cy + ch - 0.92, w: cw - 0.52, h: 0, line: { color: C.line, width: 1 } });
    s.addText([{ text: "목적  ", options: { bold: true, color: g.color } }, { text: g.purpose, options: { color: C.muted } }],
      { x: x + 0.26, y: cy + ch - 0.78, w: cw - 0.5, h: 0.66, fontFace: BF, fontSize: 11, lineSpacingMultiple: 1.12, valign: "top", margin: 0 });
  });
  card(s, M, 6.32, W - 2 * M, 0.6, C.dark, false);
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: 6.32, w: 0.14, h: 0.6, fill: { color: C.amber } });
  s.addText([
    { text: "진행 순서  ", options: { bold: true, color: C.amber } },
    { text: "통신·로직 → 데이터 → UX·화면 순으로 설계·기획했고, 각 산출물 실물은 부록에서 확인할 수 있습니다.", options: { color: C.white } },
  ], { x: M + 0.42, y: 6.32, w: W - 2 * M - 0.8, h: 0.6, fontFace: BF, fontSize: 12, valign: "middle", margin: 0 });
})();

// ===================================================================
// 14. 인사이트 → 솔루션 매핑 (브릿지)
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Bridge", "데이터에서 기능으로 — 모든 기능에 근거를 붙이다");
  const map = [
    ["앱 불안정 27.6%", "충전앱 1위", "충전 세션·앱 안정성 (자동 복구)", "P0", C.red],
    ["계정·인증·KYC 15.0%", "충전앱 2위", "간편 온보딩 · 외국인 친화", "P0", C.red],
    ["결제·지갑 11.0%", "충전앱 3위", "지갑·결제 안정 · 결제 확인 화면", "P1", C.amber],
    ["외국인·다국어", "영어 Neg 65.8%", "다국어 UI · 국제 결제", "P1", C.amber],
    ["충전소·위치 2.4%", "충전앱", "실시간 충전소 지도 · 세션 표시", "P2", C.teal],
  ];
  // header
  const tx = M, tw = W - 2 * M, ty = 1.85;
  const cols = [3.4, 1.7, 5.6, 1.0];
  const cx = [tx, tx + cols[0], tx + cols[0] + cols[1], tx + cols[0] + cols[1] + cols[2]];
  const heads = ["데이터 근거 (Pain Point)", "규모", "→ 도출한 기능", "우선순위"];
  s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ty, w: tw, h: 0.55, fill: { color: C.dark } });
  heads.forEach((h, i) => s.addText(h, { x: cx[i] + 0.15, y: ty, w: cols[i] - 0.2, h: 0.55, fontFace: BF, fontSize: 12.5, bold: true, color: C.tealLt, valign: "middle", align: i === 1 || i === 3 ? "center" : "left", margin: 0 }));
  let ry = ty + 0.55;
  const rh = 0.82;
  map.forEach(([data, scale, feat, pri, col], i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ry, w: tw, h: rh, fill: { color: i % 2 ? "EAF1EF" : C.white }, line: { color: C.line, width: 0.75 } });
    s.addText(data, { x: cx[0] + 0.15, y: ry, w: cols[0] - 0.25, h: rh, fontFace: BF, fontSize: 13, bold: true, color: C.ink, valign: "middle", margin: 0 });
    s.addText(scale, { x: cx[1], y: ry, w: cols[1], h: rh, fontFace: BF, fontSize: 11.5, color: C.muted, valign: "middle", align: "center", margin: 0 });
    s.addText(feat, { x: cx[2] + 0.15, y: ry, w: cols[2] - 0.25, h: rh, fontFace: BF, fontSize: 13, color: C.tealDk, bold: true, valign: "middle", margin: 0 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx[3] + cols[3] / 2 - 0.42, y: ry + rh / 2 - 0.21, w: 0.84, h: 0.42, rectRadius: 0.08, fill: { color: col } });
    s.addText(pri, { x: cx[3] + cols[3] / 2 - 0.42, y: ry + rh / 2 - 0.21, w: 0.84, h: 0.42, fontFace: BF, fontSize: 13, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    ry += rh;
  });
  s.addText("‘느낌’이 아니라 건수로 — 모든 기능 카드 뒤에 정량 데이터가 붙어 있습니다.", {
    x: tx, y: ry + 0.12, w: tw, h: 0.35, fontFace: BF, fontSize: 12, italic: true, color: C.muted, align: "center", margin: 0,
  });
})();

// ===================================================================
// 14.5 제품 포지셔닝 (가격 × 품질·기능)
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Product · Strategy", "제품 포지셔닝 — 가격 × 품질·기능으로 본 목표 좌표");
  // plot area
  const px0 = 1.55, px1 = 8.55, py0 = 2.05, py1 = 6.0;
  const cx = (px0 + px1) / 2, cy = (py0 + py1) / 2;
  // target quadrant tint (top-left: 저가·고품질)
  s.addShape(pres.shapes.RECTANGLE, { x: px0, y: py0, w: cx - px0, h: cy - py0, fill: { color: "E7F5F2" }, line: { type: "none" } });
  s.addText("저가 · 고기능 (목표)", { x: px0 + 0.1, y: py0 + 0.08, w: cx - px0 - 0.2, h: 0.3, fontFace: BF, fontSize: 10, bold: true, color: C.tealDk, margin: 0 });
  // axes
  s.addShape(pres.shapes.LINE, { x: cx, y: py0, w: 0, h: py1 - py0, line: { color: C.muted, width: 1, dashType: "dash" } });
  s.addShape(pres.shapes.LINE, { x: px0, y: cy, w: px1 - px0, h: 0, line: { color: C.muted, width: 1, dashType: "dash" } });
  // axis labels
  s.addText("▲ 품질 · 기능 높음", { x: px0 - 0.1, y: py0 - 0.32, w: 3, h: 0.3, fontFace: BF, fontSize: 10.5, bold: true, color: C.ink, margin: 0 });
  s.addText("◀ 저렴", { x: px0, y: py1 + 0.06, w: 1.5, h: 0.3, fontFace: BF, fontSize: 10.5, bold: true, color: C.ink, margin: 0 });
  s.addText("가격", { x: cx - 0.5, y: py1 + 0.06, w: 1.0, h: 0.3, fontFace: BF, fontSize: 10.5, color: C.muted, align: "center", margin: 0 });
  s.addText("비쌈 ▶", { x: px1 - 1.3, y: py1 + 0.06, w: 1.3, h: 0.3, fontFace: BF, fontSize: 10.5, bold: true, color: C.ink, align: "right", margin: 0 });
  // bubbles: [name, fx(가격 0=저렴), fy(품질 1=높음), color, isTarget]
  const pts = [
    ["KOKKOK EV", 0.24, 0.8, C.amber, true],
    ["LOCA EV", 0.8, 0.82, C.tealDk, false],
    ["PTT blueplus+", 0.62, 0.6, C.teal, false],
    ["Green SM", 0.46, 0.33, C.muted, false],
    ["PEA VOLTA", 0.56, 0.16, C.red, false],
    ["EleXA", 0.33, 0.24, C.red, false],
  ];
  pts.forEach(([name, fx, fy, col, tgt]) => {
    const bx = px0 + fx * (px1 - px0), by = py1 - fy * (py1 - py0);
    const d = tgt ? 0.42 : 0.26;
    s.addShape(pres.shapes.OVAL, { x: bx - d / 2, y: by - d / 2, w: d, h: d, fill: { color: col }, line: tgt ? { color: C.amberDk, width: 1.5 } : { type: "none" } });
    s.addText((tgt ? "★ " : "") + name, { x: bx + d / 2 + 0.04, y: by - 0.16, w: 2.4, h: 0.32, fontFace: BF, fontSize: tgt ? 12 : 10.5, bold: tgt, color: tgt ? C.amberDk : C.ink, valign: "middle", margin: 0 });
  });

  // right insight panel
  const rx = px1 + 0.45, rw = W - M - rx;
  card(s, rx, py0, rw, py1 - py0 + 0.3, C.dark, false);
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: py0, w: 0.14, h: py1 - py0 + 0.3, fill: { color: C.amber } });
  s.addText("KOKKOK 목표 좌표", { x: rx + 0.38, y: py0 + 0.22, w: rw - 0.6, h: 0.4, fontFace: HF, fontSize: 16, bold: true, color: C.white, margin: 0 });
  const ins = [
    "저가 · 고기능 — ‘싸고 잘 되는’ 빈 사분면을 선점.",
    "4,000₭ — 라오스 최저 단가 + 11개 기능·앱 안정성.",
    "LOCA EV(현지 1위) 대비 7% 저렴 + kWh 단일 과금.",
    "PTT는 별점 1위지만 TOU·예약비로 복잡 (태국 한정).",
  ];
  let iy = py0 + 0.78;
  ins.forEach((t) => {
    s.addShape(pres.shapes.OVAL, { x: rx + 0.38, y: iy + 0.05, w: 0.15, h: 0.15, fill: { color: C.amber } });
    s.addText(t, { x: rx + 0.66, y: iy - 0.05, w: rw - 1.0, h: 0.7, fontFace: BF, fontSize: 12, color: C.white, lineSpacingMultiple: 1.12, valign: "top", margin: 0 });
    iy += 0.74;
  });
  s.addText("⚠ 가격축은 공식 단가(태국 3사·V-Green·LOCA 수집) 기준, 품질·기능축은 별점·기능 수 기반 정성 평가.", {
    x: rx + 0.38, y: py1 - 0.35, w: rw - 0.6, h: 0.5, fontFace: BF, fontSize: 9.5, italic: true, color: "8FB3AE", lineSpacingMultiple: 1.05, valign: "top", margin: 0,
  });
})();

// ===================================================================
// 15. PRD — 기능 정의 (레이어 · 사용자 가치 · MoSCoW 통합)
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Product · PRD", "PRD 기능 정의 — 앱 6 + HW 5 = 11개 (가치 · MoSCoW)");
  const heads = ["레이어", "기능명", "설명", "사용자 가치", "MoSCoW"];
  const colWd = [0.92, 2.45, 3.95, 3.5];
  colWd.push(W - 2 * M - colWd.reduce((a, b) => a + b, 0));
  const tx = M, ty = 1.7, tw = W - 2 * M;
  const colX = [tx];
  colWd.forEach((w, i) => { if (i < colWd.length - 1) colX.push(colX[i] + w); });
  const MC = { Must: C.red, Should: C.amber, Could: C.teal };
  // [layer, name, desc, value, moscow]
  const rows = [
    ["앱", "충전 세션 자동 복구", "앱·네트워크 오류 시 세션 서버 저장·자동 복구", "충전 중 끊겨도 처음부터 다시 안 함", "Must"],
    ["앱", "QR 재시도 + 수동 입력", "QR 실패 시 자동 재시도 후 6자리 수동 입력", "QR 안 돼도 충전 시작 가능", "Must"],
    ["앱", "RFID 오프라인 결제", "통신 불안정 시 RFID 카드 태깅 결제", "네트워크 끊겨도 결제·충전", "Should"],
    ["앱", "결제 확인 화면", "결제 완료 → 충전 시작 상태 명시", "‘결제됐는데 충전 안 됨’ 불안 해소", "Should"],
    ["앱", "실시간 충전소 지도", "가용 충전기 실시간 표시", "헛걸음 없이 빈 충전기 탐색", "Could"],
    ["앱", "충전 완료 알림", "완료 5분 전 푸시 알림", "점유 페널티·대기 회피", "Could"],
    ["HW", "OCPP 2.0.1 준수 검증", "제조사 OCPP 규격 준수 사전 검증", "앱↔기기 통신 실패 근본 차단", "Must"],
    ["HW", "충전기 상태 모니터링", "충전기 상태·고장 실시간 감지", "고장 충전기 헛시도 방지", "Must"],
    ["HW", "Handshake 오류 로그", "앱-기기 통신 인증 오류 수집", "장애 원인 신속 파악", "Should"],
    ["HW", "충전기 펌웨어 OTA", "원격 펌웨어 업데이트", "현장 방문 없이 결함 대응", "Should"],
    ["HW", "충전기 고장 신고", "앱 내 고장 신고 기능", "문제 충전기 빠른 처리", "Could"],
  ];
  s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ty, w: tw, h: 0.42, fill: { color: C.dark } });
  heads.forEach((h, i) => s.addText(h, { x: colX[i] + 0.1, y: ty, w: colWd[i] - 0.16, h: 0.42, fontFace: HF, fontSize: 11, bold: true, color: i === 1 ? C.tealLt : (i === 4 ? C.amber : C.white), valign: "middle", align: (i === 0 || i === 4) ? "center" : "left", margin: 0 }));
  let ry = ty + 0.42;
  const rh = 0.355;
  rows.forEach((r, i) => {
    const lcol = r[0] === "앱" ? C.teal : C.amberDk;
    s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ry, w: tw, h: rh, fill: { color: i % 2 ? "EAF1EF" : C.white }, line: { color: C.line, width: 0.5 } });
    if (i === 6) s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ry, w: tw, h: 0.025, fill: { color: C.amberDk } }); // 앱→HW 구분선
    // layer pill
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: colX[0] + colWd[0] / 2 - 0.32, y: ry + rh / 2 - 0.13, w: 0.64, h: 0.26, rectRadius: 0.05, fill: { color: lcol } });
    s.addText(r[0], { x: colX[0] + colWd[0] / 2 - 0.32, y: ry + rh / 2 - 0.13, w: 0.64, h: 0.26, fontFace: BF, fontSize: 9.5, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    s.addText(r[1], { x: colX[1] + 0.1, y: ry, w: colWd[1] - 0.16, h: rh, fontFace: BF, fontSize: 10.5, bold: true, color: C.ink, valign: "middle", margin: 0 });
    s.addText(r[2], { x: colX[2] + 0.1, y: ry, w: colWd[2] - 0.16, h: rh, fontFace: BF, fontSize: 9.5, color: C.muted, valign: "middle", lineSpacingMultiple: 1.0, margin: 0 });
    s.addText(r[3], { x: colX[3] + 0.1, y: ry, w: colWd[3] - 0.16, h: rh, fontFace: BF, fontSize: 9.5, color: C.tealDk, valign: "middle", lineSpacingMultiple: 1.0, margin: 0 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: colX[4] + colWd[4] / 2 - 0.5, y: ry + rh / 2 - 0.135, w: 1.0, h: 0.27, rectRadius: 0.06, fill: { color: MC[r[4]] } });
    s.addText(r[4], { x: colX[4] + colWd[4] / 2 - 0.5, y: ry + rh / 2 - 0.135, w: 1.0, h: 0.27, fontFace: BF, fontSize: 9.5, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    ry += rh;
  });
  // footer: KPI + MoSCoW note
  s.addText([
    { text: "목표 KPI   ", options: { bold: true, color: C.amberDk } },
    { text: "평균 별점 2.56 → ", options: { color: C.ink } },
    { text: "3.8점", options: { bold: true, color: C.tealDk } },
    { text: "   ·   저별점 58% → ", options: { color: C.ink } },
    { text: "25%", options: { bold: true, color: C.tealDk } },
  ], { x: tx, y: ry + 0.1, w: tw * 0.6, h: 0.3, fontFace: BF, fontSize: 12, valign: "middle", margin: 0 });
  s.addText("MoSCoW: Must(필수)·Should(권장)·Could(선택) — P0→Must·P1→Should·P2→Could", {
    x: tx + tw * 0.6, y: ry + 0.1, w: tw * 0.4, h: 0.3, fontFace: BF, fontSize: 9.5, color: C.muted, align: "right", valign: "middle", margin: 0,
  });
})();

// ===================================================================
// 15.7 User Journey Map
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Product · Journey", "사용자 여정 지도 — 감정선과 터치포인트, 그리고 개선");
  const stages = [
    ["탐색·발견", "앱 지도", 0.55, 0.8, "충전소 위치·가용 정보 부족", "[F5] 실시간 충전소 지도"],
    ["QR 스캔", "충전기 QR", 0.2, 0.82, "QR 인식 실패·앱 멈춤 (앱 불안정 27.6%)", "[F2] 자동 재시도 + 수동 입력"],
    ["결제", "결제 화면", 0.25, 0.82, "결제 후 충전 안 됨 (결제·지갑 11.0%)", "[F4] RFID · [F5] 결제 확인"],
    ["충전 진행", "충전 상태", 0.3, 0.85, "세션 끊김 → 처음부터 재시작", "[F1] 세션 자동 복구"],
    ["완료·정산", "완료 알림", 0.55, 0.85, "점유 페널티·헛걸음", "[F11] 완료 알림"],
  ];
  const n = stages.length, colW = (W - 2 * M) / n, x0 = M;
  const cxs = stages.map((_, i) => x0 + i * colW + colW / 2);
  // stage header cards
  stages.forEach((st, i) => {
    const x = x0 + i * colW + 0.08;
    card(s, x, 1.85, colW - 0.16, 0.82);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.85, w: colW - 0.16, h: 0.09, fill: { color: C.teal } });
    s.addText(`${i + 1}. ${st[0]}`, { x: x + 0.12, y: 1.96, w: colW - 0.4, h: 0.34, fontFace: HF, fontSize: 13, bold: true, color: C.ink, valign: "middle", margin: 0 });
    s.addText("터치포인트 · " + st[1], { x: x + 0.12, y: 2.3, w: colW - 0.4, h: 0.3, fontFace: BF, fontSize: 10, color: C.muted, valign: "middle", margin: 0 });
  });
  // emotion zone
  const ey0 = 3.05, ey1 = 4.45;
  card(s, M, 2.92, W - 2 * M, 1.66, "F7FAF9");
  s.addText("만족 ▲", { x: M + 0.14, y: ey0 - 0.18, w: 1.1, h: 0.28, fontFace: BF, fontSize: 9.5, bold: true, color: C.tealDk, margin: 0 });
  s.addText("불만 ▼", { x: M + 0.14, y: ey1 - 0.1, w: 1.1, h: 0.28, fontFace: BF, fontSize: 9.5, bold: true, color: C.red, margin: 0 });
  // legend
  s.addShape(pres.shapes.LINE, { x: W - M - 3.4, y: 3.04, w: 0.4, h: 0, line: { color: C.red, width: 2.5 } });
  s.addText("As-Is (현재)", { x: W - M - 2.9, y: 2.9, w: 1.3, h: 0.28, fontFace: BF, fontSize: 9.5, color: C.red, valign: "middle", margin: 0 });
  s.addShape(pres.shapes.LINE, { x: W - M - 1.5, y: 3.04, w: 0.4, h: 0, line: { color: C.teal, width: 2.5 } });
  s.addText("To-Be (개선)", { x: W - M - 1.0, y: 2.9, w: 1.3, h: 0.28, fontFace: BF, fontSize: 9.5, color: C.tealDk, valign: "middle", margin: 0 });
  const dotY = (f) => ey1 - f * (ey1 - ey0);
  const drawSeg = (x1, y1, x2, y2, color) => {
    const x = Math.min(x1, x2), y = Math.min(y1, y2), w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
    s.addShape(pres.shapes.LINE, { x, y, w, h, flipV: y1 > y2, line: { color, width: 2.5 } });
  };
  // segments
  for (let i = 0; i < n - 1; i++) {
    drawSeg(cxs[i], dotY(stages[i][2]), cxs[i + 1], dotY(stages[i + 1][2]), C.red);
    drawSeg(cxs[i], dotY(stages[i][3]), cxs[i + 1], dotY(stages[i + 1][3]), C.teal);
  }
  // dots
  stages.forEach((st, i) => {
    s.addShape(pres.shapes.OVAL, { x: cxs[i] - 0.1, y: dotY(st[3]) - 0.1, w: 0.2, h: 0.2, fill: { color: C.teal } });
    s.addShape(pres.shapes.OVAL, { x: cxs[i] - 0.1, y: dotY(st[2]) - 0.1, w: 0.2, h: 0.2, fill: { color: C.red } });
  });
  // bottom: pain + fix per stage
  stages.forEach((st, i) => {
    const x = x0 + i * colW + 0.08, w = colW - 0.16;
    s.addText([{ text: "Pain  ", options: { bold: true, color: C.red } }, { text: st[4], options: { color: "8A4A4A" } }],
      { x: x + 0.02, y: 4.68, w: w - 0.04, h: 0.62, fontFace: BF, fontSize: 9.5, valign: "top", lineSpacingMultiple: 1.05, margin: 0 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x, y: 5.42, w: w, h: 0.62, rectRadius: 0.06, fill: { color: "E7F5F2" }, line: { color: "B6E2D8", width: 1 } });
    s.addText(st[5], { x: x + 0.12, y: 5.42, w: w - 0.24, h: 0.62, fontFace: BF, fontSize: 9.5, bold: true, color: C.tealDk, align: "center", valign: "middle", lineSpacingMultiple: 1.05, margin: 0 });
  });
  card(s, M, 6.2, W - 2 * M, 0.55, C.dark, false);
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: 6.2, w: 0.14, h: 0.55, fill: { color: C.amber } });
  s.addText([
    { text: "핵심  ", options: { bold: true, color: C.amber } },
    { text: "감정선이 꺼지는 지점(QR·결제·충전)마다 PRD 기능이 정확히 개입 — 골짜기를 메워 To-Be 곡선을 끌어올립니다.", options: { color: C.white } },
  ], { x: M + 0.42, y: 6.2, w: W - 2 * M - 0.8, h: 0.55, fontFace: BF, fontSize: 11.5, valign: "middle", margin: 0 });
})();

// ===================================================================
// 16. 충전 서비스 Flow
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Product · Flow", "제품 기획 ② 충전 서비스 핵심 Flow");
  const steps = [
    ["지도 탐색", "실시간 가용 상태", C.teal, "F2"],
    ["QR 스캔", "실패 시 자동 재시도\n→ 수동 ID 입력", C.amber, "F2"],
    ["결제", "Wallet 선불 / RFID\n결제 확인 화면", C.amber, "F4·F5"],
    ["OCPP\nHandshake", "앱↔충전기 통신 인증\n오류 로그 수집", C.amberDk, "F3"],
    ["충전 진행", "세션 서버 저장\nheartbeat 30초", C.teal, "F1"],
    ["완료·정산", "5분 전 알림\n유예 10분·유휴 과금", C.tealDk, "F11"],
  ];
  const n = steps.length, cw = 1.92, gap = 0.16;
  const totW = n * cw + (n - 1) * gap, x0 = (W - totW) / 2, cy = 2.25, ch = 2.5;
  steps.forEach(([t, d, col, tag], i) => {
    const x = x0 + i * (cw + gap);
    card(s, x, cy, cw, ch);
    s.addShape(pres.shapes.RECTANGLE, { x, y: cy, w: cw, h: 0.5, fill: { color: col } });
    s.addText(`${i + 1}`, { x: x + 0.12, y: cy, w: 0.5, h: 0.5, fontFace: HF, fontSize: 16, bold: true, color: C.white, valign: "middle", margin: 0 });
    s.addText(tag, { x: x + 0.5, y: cy, w: cw - 0.6, h: 0.5, fontFace: BF, fontSize: 10, bold: true, color: "EAF7F4", align: "right", valign: "middle", margin: 0 });
    s.addText(t, { x: x + 0.1, y: cy + 0.62, w: cw - 0.2, h: 0.72, fontFace: HF, fontSize: 14, bold: true, color: C.ink, align: "center", valign: "top", lineSpacingMultiple: 0.95, margin: 0 });
    s.addText(d, { x: x + 0.12, y: cy + 1.4, w: cw - 0.24, h: 1.0, fontFace: BF, fontSize: 10.5, color: C.muted, align: "center", valign: "top", lineSpacingMultiple: 1.05, margin: 0 });
    if (i < n - 1) s.addText("→", { x: x + cw - 0.02, y: cy + ch / 2 - 0.25, w: gap + 0.04, h: 0.5, fontFace: HF, fontSize: 18, bold: true, color: C.amber, align: "center", valign: "middle", margin: 0 });
  });
  // legend
  const leg = [["정상 플로우", C.teal], ["PRD 기능 [Fx]", C.amber], ["HW 연동", C.amberDk], ["오류 분기 대응", C.red]];
  let lx = (W - (leg.length * 2.6)) / 2 + 0.4;
  leg.forEach(([t, c]) => {
    s.addShape(pres.shapes.OVAL, { x: lx, y: 5.35, w: 0.2, h: 0.2, fill: { color: c } });
    s.addText(t, { x: lx + 0.28, y: 5.28, w: 2.2, h: 0.34, fontFace: BF, fontSize: 11.5, color: C.ink, valign: "middle", margin: 0 });
    lx += 2.6;
  });
  card(s, M, 5.85, W - 2 * M, 0.78, C.dark, false);
  s.addText([
    { text: "오류는 예외가 아니라 기본값  ", options: { bold: true, color: C.amber } },
    { text: "— QR 실패·OCPP 오류·세션 끊김 등 데이터에서 확인된 실패 지점마다 복구 분기를 플로우에 내장했습니다.", options: { color: C.white } },
  ], { x: M + 0.4, y: 5.85, w: W - 2 * M - 0.8, h: 0.78, fontFace: BF, fontSize: 12.5, valign: "middle", lineSpacingMultiple: 1.05, margin: 0 });
})();

// ===================================================================
// 17. OCPP / 제조사 연동
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Product · Hardware", "제품 기획 ③ OCPP 1.6J 연동 — 제조사 3사 스펙 검증");
  // manufacturer table
  const heads = ["검증 항목", "NANCOME", "COSTEL", "ABB"];
  const rows = [
    ["OCPP 버전", "1.6J", "1.6J", "1.6J"],
    ["보안 프로토콜", "Security Profile 2", "Profile 1 & 2 (TLS)", "TLS 1.2+ WSS"],
    ["오프라인 인증", "로컬 화이트리스트", "단절 시 충전 유지", "오프라인 허용/차단"],
    ["목표 kWh 자동종료", "서버 RemoteStop", "기기 자체 Local Stop", "서버 의존(Backend)"],
    ["펌웨어 OTA", "지원 (VPN/OCPP)", "지원 (OTA)", "지원 (Ability)"],
  ];
  const tx = M, ty = 1.8, tw = 8.3;
  const cw0 = 2.6, cwx = (tw - cw0) / 3;
  const colX = [tx, tx + cw0, tx + cw0 + cwx, tx + cw0 + 2 * cwx];
  const colWd = [cw0, cwx, cwx, cwx];
  s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ty, w: tw, h: 0.55, fill: { color: C.dark } });
  heads.forEach((h, i) => s.addText(h, { x: colX[i] + 0.1, y: ty, w: colWd[i] - 0.15, h: 0.55, fontFace: HF, fontSize: 12.5, bold: true, color: i === 0 ? C.tealLt : C.white, valign: "middle", align: i === 0 ? "left" : "center", margin: 0 }));
  let ry = ty + 0.55;
  const rh = 0.74;
  rows.forEach((r, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ry, w: tw, h: rh, fill: { color: i % 2 ? "EAF1EF" : C.white }, line: { color: C.line, width: 0.75 } });
    r.forEach((c, j) => s.addText(c, { x: colX[j] + 0.1, y: ry, w: colWd[j] - 0.15, h: rh, fontFace: BF, fontSize: j === 0 ? 12 : 11, bold: j === 0, color: j === 0 ? C.ink : C.tealDk, valign: "middle", align: j === 0 ? "left" : "center", lineSpacingMultiple: 1.0, margin: 0 }));
    ry += rh;
  });
  // right insight
  const rx = tx + tw + 0.3, rw = W - M - rx;
  card(s, rx, ty, rw, 0.55 + 5 * rh, C.dark, false);
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: ty, w: 0.14, h: 0.55 + 5 * rh, fill: { color: C.amber } });
  s.addText("왜 직접 검증했나", { x: rx + 0.38, y: ty + 0.22, w: rw - 0.6, h: 0.4, fontFace: HF, fontSize: 14.5, bold: true, color: C.white, margin: 0 });
  s.addText([
    { text: "분석에서 ", options: { color: "C9DBD8" } },
    { text: "OCPP 호환문제가 169건", options: { bold: true, color: C.tealLt } },
    { text: "으로 최다 → 제조사별 실제 스펙을 직접 대조했습니다.\n\n", options: { color: "C9DBD8" } },
    { text: "핵심 발견: ", options: { bold: true, color: C.amber } },
    { text: "OCPP 1.6 ChargingProfile은 ‘속도 한도’ 제어용이라 목표 kWh 자동종료가 불가 → ", options: { color: "C9DBD8" } },
    { text: "서버 RemoteStop / 기기 Local Stop", options: { bold: true, color: C.tealLt } },
    { text: " 등 제조사별 우회 설계를 요금정책에 반영.", options: { color: "C9DBD8" } },
  ], { x: rx + 0.38, y: ty + 0.7, w: rw - 0.65, h: 3.4, fontFace: BF, fontSize: 11.5, lineSpacingMultiple: 1.15, valign: "top", margin: 0 });
})();

// ===================================================================
// 18. 요금 정책
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Product · Policy", "제품 기획 ④ 요금 정책 — LOCA EV 벤치마킹");
  // comparison table
  const heads = ["항목", "LOCA EV (경쟁사)", "KOKKOK (제안)"];
  const rows = [
    ["결제 기반", "카드 가승인 / 후불", "Wallet 선불 (미수금 차단)"],
    ["과금 방식", "시간(분) + 전력량", "전력량(kWh) 단일 — 공정성"],
    ["에너지 단가", "4,300 ₭/kWh", "4,000 ₭/kWh"],
    ["유휴 유예 시간", "7분", "10분 (넉넉한 유예)"],
    ["예약 보증금", "없음", "10,000 ₭ (노쇼 방지)"],
  ];
  const tx = M, ty = 1.82, tw = 7.7;
  const cw0 = 2.4, cwx = (tw - cw0) / 2;
  const colX = [tx, tx + cw0, tx + cw0 + cwx];
  const colWd = [cw0, cwx, cwx];
  s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ty, w: tw, h: 0.56, fill: { color: C.dark } });
  heads.forEach((h, i) => s.addText(h, { x: colX[i] + 0.12, y: ty, w: colWd[i] - 0.2, h: 0.56, fontFace: HF, fontSize: 12.5, bold: true, color: i === 2 ? C.amber : (i === 0 ? C.tealLt : C.white), valign: "middle", align: i === 0 ? "left" : "center", margin: 0 }));
  let ry = ty + 0.56;
  const rh = 0.74;
  rows.forEach((r, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ry, w: tw, h: rh, fill: { color: i % 2 ? "EAF1EF" : C.white }, line: { color: C.line, width: 0.75 } });
    s.addText(r[0], { x: colX[0] + 0.12, y: ry, w: colWd[0] - 0.2, h: rh, fontFace: BF, fontSize: 12, bold: true, color: C.ink, valign: "middle", margin: 0 });
    s.addText(r[1], { x: colX[1] + 0.1, y: ry, w: colWd[1] - 0.18, h: rh, fontFace: BF, fontSize: 11.5, color: C.muted, valign: "middle", align: "center", margin: 0 });
    s.addText(r[2], { x: colX[2] + 0.1, y: ry, w: colWd[2] - 0.18, h: rh, fontFace: BF, fontSize: 11.5, bold: true, color: C.tealDk, valign: "middle", align: "center", margin: 0 });
    ry += rh;
  });
  // right principle cards
  const rx = tx + tw + 0.3, rw = W - M - rx;
  const cards = [
    ["선불 Wallet 결제", "OCPP 실시간 계량 데이터로 잔액 대조·즉시 차감 → 미수금 원천 차단", C.teal],
    ["kWh 단일 과금", "시간 과금 제거로 사용자 체감 공정성 확보", C.amber],
    ["데이터로 단가 설계", "결제 Pain Point 해소 + 경쟁사 단가 대비 가격 우위", C.amberDk],
  ];
  let cyy = ty;
  const chh = (0.56 + 5 * rh - 2 * 0.18) / 3;
  cards.forEach(([h, d, col]) => {
    card(s, rx, cyy, rw, chh);
    s.addShape(pres.shapes.RECTANGLE, { x: rx, y: cyy, w: 0.12, h: chh, fill: { color: col } });
    s.addText(h, { x: rx + 0.32, y: cyy + 0.12, w: rw - 0.5, h: 0.4, fontFace: HF, fontSize: 13.5, bold: true, color: C.ink, margin: 0 });
    s.addText(d, { x: rx + 0.32, y: cyy + 0.56, w: rw - 0.5, h: chh - 0.6, fontFace: BF, fontSize: 11, color: C.muted, lineSpacingMultiple: 1.1, valign: "top", margin: 0 });
    cyy += chh + 0.18;
  });
})();

// ===================================================================
// 18.5 완성된 정책안 상세 (요금 체계 + 운영 규칙)
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Product · Policy", "완성된 정책안 — 요금 체계 & 운영 규칙 (vs LOCA EV)");
  // left: final fee table (KOKKOK vs LOCA)
  const heads = ["항목", "KOKKOK (확정)", "LOCA EV (참고)"];
  const rows = [
    ["결제 방식", "Wallet 선불", "카드 가승인·후불"],
    ["충전 최소 잔액", "20,000 ₭", "15,000 ₭"],
    ["과금 방식", "전력량(kWh) 단일", "시간(분) + kWh"],
    ["에너지 단가", "4,000 ₭/kWh", "4,300 ₭/kWh"],
    ["연결 수수료", "7,000 ₭ (4분 초과)", "7,000 ₭"],
    ["유휴 페널티", "1,000 ₭/분 · 10분 유예", "1,000 ₭ · 7분"],
    ["예약 보증금", "10,000 ₭", "없음"],
  ];
  const tx = M, ty = 1.85, tw = 7.2;
  const cw0 = 2.2, cwx = (tw - cw0) / 2;
  const colX = [tx, tx + cw0, tx + cw0 + cwx], colWd = [cw0, cwx, cwx];
  s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ty, w: tw, h: 0.5, fill: { color: C.dark } });
  heads.forEach((h, i) => s.addText(h, { x: colX[i] + 0.1, y: ty, w: colWd[i] - 0.15, h: 0.5, fontFace: HF, fontSize: 12, bold: true, color: i === 1 ? C.amber : (i === 0 ? C.tealLt : C.white), valign: "middle", align: i === 0 ? "left" : "center", margin: 0 }));
  let ry = ty + 0.5;
  const rh = 0.55;
  rows.forEach((r, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: tx, y: ry, w: tw, h: rh, fill: { color: i % 2 ? "EAF1EF" : C.white }, line: { color: C.line, width: 0.75 } });
    s.addText(r[0], { x: colX[0] + 0.1, y: ry, w: colWd[0] - 0.15, h: rh, fontFace: BF, fontSize: 11.5, bold: true, color: C.ink, valign: "middle", margin: 0 });
    s.addText(r[1], { x: colX[1] + 0.08, y: ry, w: colWd[1] - 0.14, h: rh, fontFace: BF, fontSize: 11.5, bold: true, color: C.tealDk, valign: "middle", align: "center", margin: 0 });
    s.addText(r[2], { x: colX[2] + 0.08, y: ry, w: colWd[2] - 0.14, h: rh, fontFace: BF, fontSize: 11, color: C.muted, valign: "middle", align: "center", margin: 0 });
    ry += rh;
  });
  s.addText("KOKKOK 차별점 — 선불 Wallet · kWh 단일 과금 · 유휴 유예 +3분 · 예약 보증금(노쇼 방지)", {
    x: tx, y: ry + 0.1, w: tw, h: 0.32, fontFace: BF, fontSize: 10.5, italic: true, color: C.amberDk, margin: 0,
  });

  // right: operational rules
  const rx = tx + tw + 0.3, rw = W - M - rx, ph = 0.5 + 7 * rh;
  card(s, rx, ty, rw, ph, C.dark, false);
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: ty, w: 0.14, h: ph, fill: { color: C.amber } });
  s.addText("운영 규칙", { x: rx + 0.4, y: ty + 0.2, w: rw - 0.7, h: 0.4, fontFace: HF, fontSize: 15, bold: true, color: C.white, margin: 0 });
  const rules = [
    ["결제 · 정산", "Wallet 선불 차감 → 잔액 0 도달 시 충전 자동 종료 (미수금 0)"],
    ["충전 시작 조건", "충전기 Available · 통신 정상 · 최소 잔액 · 1계정 1충전"],
    ["충전 종료", "완충(BMS) · 종료 버튼 · 5분 통신 단절 자동 종료 · 잔액 소진"],
    ["충전기 상태 (OCPP)", "Faulted · Offline 상태는 시작 버튼 자동 비활성화"],
  ];
  let iy = ty + 0.78;
  rules.forEach(([h, d]) => {
    s.addShape(pres.shapes.OVAL, { x: rx + 0.4, y: iy + 0.05, w: 0.16, h: 0.16, fill: { color: C.amber } });
    s.addText([
      { text: h + "\n", options: { bold: true, color: C.tealLt, fontSize: 12.5 } },
      { text: d, options: { color: "C9DBD8", fontSize: 11 } },
    ], { x: rx + 0.7, y: iy - 0.04, w: rw - 1.0, h: 0.92, fontFace: BF, lineSpacingMultiple: 1.1, valign: "top", margin: 0 });
    iy += 0.92;
  });
})();

divider("4", "05", "기대효과 & 회고", "Impact & Retrospective", "측정 가능한 목표 · 리스크·가정·한계 · 배운 것");

// ===================================================================
// 20. 기대 효과 & KPI
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Impact", "기대 효과 — 데이터로 세운 목표");
  const ks = [
    ["2.56", "→ 3.8", "평균 별점", "PTT 벤치마크 추월", C.teal],
    ["58%", "→ 25%", "1~2점 저별점 비율", "앱 안정성 개선", C.amber],
    ["27.6%", "→ ½", "충전앱 앱 불안정", "세션 안정성 개선", C.red],
    ["15.0%", "→ 개선", "계정·KYC 온보딩", "간편 가입·외국인", C.tealDk],
  ];
  const sw = 2.95, sg = 0.2, sx0 = (W - (4 * sw + 3 * sg)) / 2, sy = 1.95;
  ks.forEach(([from, to, label, sub, col], i) => {
    const x = sx0 + i * (sw + sg);
    card(s, x, sy, sw, 3.0);
    s.addShape(pres.shapes.RECTANGLE, { x, y: sy, w: sw, h: 0.12, fill: { color: col } });
    s.addText(from, { x: x + 0.1, y: sy + 0.4, w: sw - 0.2, h: 0.55, fontFace: BF, fontSize: 22, color: C.muted, align: "center", valign: "middle", strike: false, margin: 0 });
    s.addText(to, { x: x + 0.1, y: sy + 0.95, w: sw - 0.2, h: 0.85, fontFace: HF, fontSize: 40, bold: true, color: col, align: "center", valign: "middle", margin: 0 });
    s.addText(label, { x: x + 0.1, y: sy + 1.9, w: sw - 0.2, h: 0.4, fontFace: HF, fontSize: 14, bold: true, color: C.ink, align: "center", margin: 0 });
    s.addText(sub, { x: x + 0.12, y: sy + 2.32, w: sw - 0.24, h: 0.5, fontFace: BF, fontSize: 11, color: C.muted, align: "center", valign: "top", margin: 0 });
  });
  card(s, M, 5.35, W - 2 * M, 1.05, C.dark, false);
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: 5.35, w: 0.16, h: 1.05, fill: { color: C.amber } });
  s.addText([
    { text: "측정 가능한 목표  ", options: { bold: true, color: C.amber } },
    { text: "모든 KPI는 수집한 28,890건 리뷰의 현재 baseline에서 출발합니다. ", options: { color: C.white } },
    { text: "출시 후 동일 파이프라인으로 재측정해 개선 효과를 검증할 수 있습니다.", options: { color: C.tealLt } },
  ], { x: M + 0.45, y: 5.35, w: W - 2 * M - 0.9, h: 1.05, fontFace: BF, fontSize: 13.5, valign: "middle", lineSpacingMultiple: 1.12, margin: 0 });
})();

// ===================================================================
// 21. 회고 — 계획 대비 변경
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Retrospective", "회고 — 계획은 데이터 앞에서 계속 바뀌었다");
  const items = [
    ["분석 앱 3 → 5개", "LOCA EV 리뷰 7건뿐 → 태국 비교군 추가"],
    ["뉴스·HW 수집 추가", "VOC와 시장정보 분리 필요 → 테이블 분리 설계"],
    ["전체 번역 → 다국어 직접", "12시간 병목 → XLM-RoBERTa로 2시간 단축"],
    ["DB 집계 → Python", "Supabase 10초 timeout → 배치·pandas 처리"],
    ["키워드 분류 확장", "Negative만 → 전체 리뷰로 확대 (긍·중립 포함)"],
    ["스키마 컬럼 보강", "실행 중 오류 발견 → ALTER TABLE 즉시 대응"],
  ];
  const cw = (W - 2 * M - 0.4) / 3, gap = 0.2, ch = 1.55;
  items.forEach(([h, d], i) => {
    const x = M + (i % 3) * (cw + gap);
    const y = 1.9 + Math.floor(i / 3) * (ch + 0.25);
    card(s, x, y, cw, ch);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: 0.1, fill: { color: i < 3 ? C.teal : C.amber } });
    s.addText(h, { x: x + 0.25, y: y + 0.22, w: cw - 0.45, h: 0.5, fontFace: HF, fontSize: 13.5, bold: true, color: C.ink, valign: "top", margin: 0 });
    s.addText(d, { x: x + 0.25, y: y + 0.74, w: cw - 0.45, h: 0.72, fontFace: BF, fontSize: 11, color: C.muted, lineSpacingMultiple: 1.12, valign: "top", margin: 0 });
  });
  card(s, M, 5.55, W - 2 * M, 0.92, C.dark, false);
  s.addText([
    { text: "배운 것  ", options: { bold: true, color: C.amber } },
    { text: "계획대로 된 건 거의 없었지만, 매 변경마다 ‘왜’를 데이터로 설명할 수 있었습니다. 그 과정 자체가 PM의 근거였습니다.", options: { color: C.white } },
  ], { x: M + 0.45, y: 5.55, w: W - 2 * M - 0.9, h: 0.92, fontFace: BF, fontSize: 13.5, italic: true, valign: "middle", lineSpacingMultiple: 1.1, margin: 0 });
})();

// ===================================================================
// 21.5 리스크 · 가정 · 한계 (통합)
// ===================================================================
(() => {
  const s = pres.addSlide();
  chrome(s, "Risks & Assumptions", "리스크 · 가정 · 한계 — 정직하게 남겨둔 것");
  const cols = [
    ["데이터 한계", C.red, [
      "VOC 92%가 Green SM(베트남 라이드헤일링) → 충전 전용 표본은 1,227건으로 작음",
      "라오스 1차 데이터 희소(LOCA 7건·KOKKOK 378) · 라오어 NLP·Google 색인 취약",
      "재분류 후에도 ‘기타’ 16.6% 잔존(오타·초단문 등 비분류성)",
      "하드웨어 뉴스는 추정 — 인과 주장에 한계 · 뉴스 SoV는 인지도 프록시",
    ]],
    ["시장 · 실행 리스크", C.amber, [
      "VinFast·Xanh SM 공격적 진입(뉴스 점유율 1위) → 경쟁 심화",
      "KOKKOK Move 현지 인지도 약세 → 마케팅·차별화 부담",
      "충전 인프라 확장 비용 · 전력·부지 의존",
      "Meta API 제약으로 Facebook(현지 핵심 채널) 미수집",
    ]],
    ["핵심 가정", C.tealDk, [
      "내연기관 수입 중단(2026) → EV 수요 급증이 지속된다",
      "LOCA의 ‘1년 내 투자금 회수’ 모델이 재현 가능하다",
      "앱 안정성·온보딩 개선이 별점·점유율 상승으로 이어진다",
      "KOKKOK Move의 기존 현지 운영 기반이 충전 확장의 강점이 된다",
    ]],
  ];
  const gap = 0.3, cw = (W - 2 * M - 2 * gap) / 3, cy = 1.85, ch = 4.05;
  cols.forEach(([title, col, items], i) => {
    const x = M + i * (cw + gap);
    card(s, x, cy, cw, ch);
    s.addShape(pres.shapes.RECTANGLE, { x, y: cy, w: cw, h: 0.56, fill: { color: col } });
    s.addText(title, { x: x + 0.18, y: cy, w: cw - 0.3, h: 0.56, fontFace: HF, fontSize: 14, bold: true, color: C.white, valign: "middle", margin: 0 });
    s.addText(items.map((t) => ({ text: t, options: { bullet: { code: "2022", indent: 12 }, breakLine: true, paraSpaceAfter: 9 } })),
      { x: x + 0.26, y: cy + 0.74, w: cw - 0.48, h: ch - 0.9, fontFace: BF, fontSize: 11, color: C.ink, lineSpacingMultiple: 1.1, valign: "top", margin: 0 });
  });
  card(s, M, cy + ch + 0.15, W - 2 * M, 0.92, C.dark, false);
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: cy + ch + 0.15, w: 0.16, h: 0.92, fill: { color: C.amber } });
  s.addText([
    { text: "그래서  ", options: { bold: true, color: C.amber } },
    { text: "한계를 숨기지 않고 명시했습니다. 다음 단계는 Facebook 인지도·라오어 커뮤니티 수집으로 라오스 1차 데이터를 더 채우는 것입니다.", options: { color: C.white } },
  ], { x: M + 0.45, y: cy + ch + 0.15, w: W - 2 * M - 0.9, h: 0.92, fontFace: BF, fontSize: 13, valign: "middle", lineSpacingMultiple: 1.1, margin: 0 });
})();

// ===================================================================
// 22. CLOSING
// ===================================================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.dark };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.14, fill: { color: C.amber } });
  s.addShape(pres.shapes.OVAL, { x: -1.8, y: 4.0, w: 5.0, h: 5.0, fill: { color: C.dark2, transparency: 40 } });
  s.addShape(pres.shapes.OVAL, { x: W - 2.6, y: -1.6, w: 4.2, h: 4.2, fill: { color: C.tealDk, transparency: 45 } });

  s.addText("정리하며", { x: M + 0.1, y: 1.5, w: 10, h: 0.4, fontFace: BF, fontSize: 14, bold: true, color: C.tealLt, charSpacing: 2, margin: 0 });
  s.addText([
    { text: "데이터로 근거를 만들고,\n", options: { color: C.white } },
    { text: "근거로 제품을 설계했습니다.", options: { color: C.amber } },
  ], { x: M + 0.05, y: 2.05, w: 11.5, h: 1.8, fontFace: HF, fontSize: 44, bold: true, lineSpacingMultiple: 1.08, margin: 0 });

  const pts = [
    "39,700+ 건의 멀티채널 VOC를 직접 수집·전처리·분석",
    "‘앱오류=OCPP’ 가설을 도메인 분리 재분류로 검증·수정 — VOC 92%가 라이드헤일링이었다",
    "PRD · 플로우 · OCPP 연동 · 요금정책까지 실제 산출물로 연결",
  ];
  let py = 4.0;
  pts.forEach((t) => {
    s.addShape(pres.shapes.OVAL, { x: M + 0.1, y: py + 0.05, w: 0.2, h: 0.2, fill: { color: C.amber } });
    s.addText(t, { x: M + 0.45, y: py - 0.05, w: 11, h: 0.45, fontFace: BF, fontSize: 15, color: C.tealLt, valign: "middle", margin: 0 });
    py += 0.6;
  });

  s.addShape(pres.shapes.LINE, { x: M + 0.1, y: 6.25, w: W - 2 * M - 0.2, h: 0, line: { color: C.dark2, width: 1.5 } });
  s.addText([
    { text: "감사합니다.  ", options: { bold: true, color: C.white, fontSize: 18 } },
    { text: "Q & A", options: { color: C.amber, bold: true, fontSize: 18 } },
  ], { x: M + 0.1, y: 6.5, w: 7, h: 0.5, fontFace: HF, valign: "middle", margin: 0 });
  s.addText("코코넛사일로 · KOKKOK EV  |  마수한 · 김재희  |  2026-06-19", {
    x: W - 6.6, y: 6.5, w: 6, h: 0.5, fontFace: BF, fontSize: 11, color: "8FB3AE", align: "right", valign: "middle", margin: 0,
  });
})();

// ===================================================================
// APPENDIX — 단계별 산출물
// ===================================================================
const DELIVERABLES = [
  // ----- 설계 산출물 -----
  { file: "del_ocpp", name: "OCPP 1.6-J 데이터 명세서", stage: "설계", color: C.amberDk,
    desc: "충전기 ↔ 중앙서버(CSMS) 간 OCPP 1.6-J 통신 메시지·데이터 필드·제약·JSON 스키마·상태값을 정의한 통신 규격 명세서.",
    role: "분석에서 최다로 드러난 OCPP·호환문제(169건)를 표준 준수로 해소하기 위한 개발 기준 문서.",
    note: "원본: OCPP 1.6 edition 2 / errata-sheet 기반 · BootNotification·StatusNotification 등 메시지별 정의 (총 17p)" },
  { file: "del_erd", name: "ERD", stage: "설계", color: C.amberDk,
    desc: "VOC·시장 데이터와 서비스 데이터를 담는 엔티티와 관계를 모델링한 다이어그램 (chargers · charging_sessions · transactions 등).",
    role: "테이블 구조와 FK 관계를 정의 — 분석 파이프라인과 서비스 DB의 청사진." },
  { file: "del_db", name: "DB 구조 설계", stage: "설계", color: C.amberDk,
    desc: "테이블·컬럼·타입·제약조건을 정의한 스키마 설계 및 DDL(create_tables.sql).",
    role: "ERD를 실행 가능한 스키마로 구체화 — 개발 착수 시 그대로 DB 구축에 사용." },
  { file: "del_flowchart", name: "알고리즘 Flow Chart (순서도)", stage: "설계", color: C.amberDk,
    desc: "충전 시작·완료·결제 프로세스의 분기와 예외 처리를 단계(QR→결제→OCPP→종료)별로 표현한 순서도.",
    role: "QR 실패·세션 복구 등 핵심 로직의 분기 조건을 빠짐없이 정의 — 개발 구현 기준." },
  { file: "del_sequence", name: "시퀀스 다이어그램", stage: "설계", color: C.amberDk,
    desc: "앱·서버·충전기 간 OCPP 메시지(RemoteStart·StatusNotification·MeterValues 등)를 시간순으로 표현한 시퀀스 다이어그램.",
    role: "객체 간 통신 순서와 책임을 명확히 — Handshake·상태 전이 구현의 직접 근거." },
  // ----- 기획 산출물 -----
  { file: "del_scenario", name: "시나리오", stage: "기획", color: C.teal,
    desc: "사용자가 충전을 시작·진행·종료하는 행동 흐름과 예외 상황을 정의한 유스 시나리오.",
    role: "데이터에서 확인한 Pain Point를 실제 사용 맥락으로 구체화 — 기능 설계의 출발점." },
  { file: "del_storyboard", name: "스토리보드 (화면설계서)", stage: "기획", color: C.teal,
    desc: "화면별 레이아웃·구성요소·동작·예외 처리를 정의한 화면설계서.",
    role: "PRD 기능을 실제 UI로 구체화 — 디자인·개발이 참조하는 화면 명세." },
  { file: "del_prototype", name: "프로토타이핑", stage: "기획", color: C.teal,
    desc: "Figma 기반 인터랙티브 프로토타입으로 핵심 충전 플로우를 실제 조작 가능하게 구현.",
    role: "기획 단계에서 사용자 흐름을 검증 — 개발 전 리스크를 조기에 발견." },
];

// Appendix divider
(() => {
  chapStart["A"] = pageNo + 1;
  const s = pres.addSlide();
  s.background = { color: C.dark };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.14, fill: { color: C.amber } });
  s.addShape(pres.shapes.OVAL, { x: W - 3.0, y: -1.8, w: 4.6, h: 4.6, fill: { color: C.dark2, transparency: 40 } });
  s.addText("APPENDIX", { x: M + 0.1, y: 1.45, w: 8, h: 0.4, fontFace: BF, fontSize: 14, bold: true, color: C.tealLt, charSpacing: 3, margin: 0 });
  s.addText("부록 — 단계별 산출물", { x: M + 0.05, y: 1.9, w: 11, h: 1.0, fontFace: HF, fontSize: 40, bold: true, color: C.white, margin: 0 });
  s.addText("데이터 분석 → 기획 → 설계 전 과정에서 실제로 만든 산출물 + 용어 사전입니다. (발표 시 생략 · 열람·Q&A용)", { x: M + 0.1, y: 3.0, w: 11.5, h: 0.4, fontFace: BF, fontSize: 14, color: C.tealLt, margin: 0 });

  const groups = [
    ["기획 산출물", C.teal, ["시나리오", "스토리보드 (화면설계서)", "프로토타이핑"]],
    ["설계 산출물", C.amber, ["OCPP 1.6-J 데이터 명세서", "ERD", "DB 구조 설계", "알고리즘 순서도(Flow Chart)", "시퀀스 다이어그램"]],
  ];
  const gw = 5.5, gp = 0.5, gx0 = M + 0.05, gy = 3.85;
  groups.forEach(([title, col, items], i) => {
    const x = gx0 + i * (gw + gp);
    s.addShape(pres.shapes.RECTANGLE, { x, y: gy, w: 0.12, h: 2.0, fill: { color: col } });
    s.addText(title, { x: x + 0.3, y: gy, w: gw - 0.4, h: 0.4, fontFace: HF, fontSize: 17, bold: true, color: C.white, margin: 0 });
    s.addText(items.map((t) => ({ text: t, options: { bullet: { code: "2022", indent: 14 }, breakLine: true, paraSpaceAfter: 6, color: C.tealLt } })),
      { x: x + 0.32, y: gy + 0.5, w: gw - 0.5, h: 1.5, fontFace: BF, fontSize: 13.5, valign: "top", margin: 0 });
  });
})();

DELIVERABLES.forEach((d) => artifactSlide(d));

// ===================================================================
// APPENDIX — 용어 사전 (Glossary) · 과정 단계별
// ===================================================================
function glossarySlide(title, columns) {
  const s = pres.addSlide();
  chrome(s, "Appendix · Glossary", title);
  const colW = (W - 2 * M - 0.5) / 2;
  const colX = [M, M + colW + 0.5];
  columns.forEach((groups, ci) => {
    const cx = colX[ci];
    let y = 1.66;
    groups.forEach(([stage, col, terms]) => {
      s.addShape(pres.shapes.RECTANGLE, { x: cx, y, w: colW, h: 0.34, fill: { color: col } });
      s.addText(stage, { x: cx + 0.14, y, w: colW - 0.25, h: 0.34, fontFace: HF, fontSize: 12, bold: true, color: C.white, valign: "middle", margin: 0 });
      y += 0.42;
      terms.forEach(([t, d]) => {
        s.addText([{ text: t + " — ", options: { bold: true, color: C.ink } }, { text: d, options: { color: C.muted } }],
          { x: cx + 0.1, y, w: colW - 0.15, h: 0.235, fontFace: BF, fontSize: 9, valign: "middle", lineSpacingMultiple: 1.0, margin: 0 });
        y += 0.235;
      });
      y += 0.14;
    });
  });
}

glossarySlide("용어 사전 ① — 시장분석 · 데이터 수집 · 전처리 · 분석", [
  [
    ["시장 분석", C.tealDk, [
      ["PEST", "정치·경제·사회·기술 거시환경 분석 프레임"],
      ["TAM-SAM-SOM", "전체·유효·수익가능 시장 규모 3단계"],
      ["Share of Voice", "매체 언급량 점유율 — 브랜드 인지도 프록시"],
      ["벤치마크", "비교·목표로 삼는 선도 사례"],
      ["IR", "기업이 공시하는 투자자 정보(실적·전략)"],
      ["CAGR", "연평균 성장률"],
    ]],
    ["데이터 수집", C.teal, [
      ["VOC", "Voice of Customer — 리뷰·댓글 등 고객의 소리"],
      ["스크래핑", "웹/앱에서 데이터를 자동 추출"],
      ["RSS / API", "표준 피드/프로그램 인터페이스로 데이터 수신"],
      ["페이지네이션", "대량 결과를 분할 수집(토큰 제한 우회)"],
      ["멀티채널", "앱·유튜브·뉴스·블로그 등 복수 출처"],
    ]],
  ],
  [
    ["데이터 전처리", C.amberDk, [
      ["언어 감지(langdetect)", "텍스트 언어 자동 판별"],
      ["감성 분석", "긍정·부정·중립으로 분류"],
      ["XLM-RoBERTa", "100개 언어 다국어 감성 분석 모델"],
      ["배치 처리(Batching)", "대량 작업을 소량씩 분할 실행(timeout 회피)"],
      ["upsert", "있으면 갱신·없으면 삽입"],
    ]],
    ["데이터 분석", C.amber, [
      ["키워드 카테고리 분류", "규칙 기반으로 불만 유형 태깅"],
      ["도메인 분리", "라이드헤일링·충전·앱공통 영역 구분"],
      ["분모(denominator)", "비율 계산의 기준 모집단"],
      ["표본 편향", "특정 그룹 과대표집(예: vi 77.8%)"],
      ["동시타당도", "다른 지표와의 일치로 신뢰도 점검"],
      ["기타·미상", "어떤 카테고리에도 안 잡힌 미분류분"],
    ]],
  ],
]);

glossarySlide("용어 사전 ② — 시각화 · 기획 · 설계", [
  [
    ["데이터 시각화", C.tealDk, [
      ["포지셔닝 맵", "2축 평면에 경쟁자·목표를 배치"],
      ["워드클라우드", "빈출 단어를 크기로 시각화"],
      ["2계층 차트", "도메인을 나눠 비교한 차트"],
    ]],
    ["기획", C.teal, [
      ["PRD", "제품 요구사항 정의서"],
      ["페르소나", "데이터로 정의한 대표 사용자상"],
      ["사용자 여정 지도", "단계별 경험·감정·터치포인트"],
      ["Pain Point", "사용자의 불편·고충"],
      ["MoSCoW", "Must/Should/Could/Won't 우선순위"],
      ["KPI", "핵심성과지표"],
      ["Non-goals", "의도적으로 범위에서 제외한 것"],
      ["수용 기준", "기능 완료를 판정하는 측정 조건"],
    ]],
  ],
  [
    ["설계", C.amberDk, [
      ["ERD", "개체-관계 다이어그램(DB 구조)"],
      ["DDL", "테이블을 생성하는 SQL"],
      ["OCPP", "앱↔충전기 통신 개방형 표준 프로토콜"],
      ["CSMS", "충전 중앙관리 시스템"],
      ["시퀀스 다이어그램", "객체 간 통신을 시간순으로 표현"],
      ["플로우차트", "프로세스 분기·예외를 표현한 순서도"],
      ["RFID", "무선 태그 인식 — 오프라인 결제"],
      ["KYC", "본인 인증(Know Your Customer)"],
      ["슈퍼앱", "모빌리티+쇼핑+충전 등을 한 앱에 통합"],
    ]],
  ],
]);

// fill index (목차) page numbers now that all chapter pages are known
tocRowMeta.forEach((m) => {
  tocSlide.addText("p." + (chapStart[m.key] != null ? chapStart[m.key] : "-"), {
    x: m.x, y: m.y, w: m.w, h: 0.42, fontFace: HF, fontSize: 15, bold: true, color: C.tealDk, align: "right", valign: "middle", margin: 0,
  });
});

pres.writeFile({ fileName: path.join(__dirname, "KOKKOK_EV_발표자료.pptx") }).then((fn) => {
  console.log("WROTE:", fn);
});
