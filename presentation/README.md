# 🎤 presentation — KOKKOK EV 발표자료

데이터 분석([`../03_분석_analysis`](../03_분석_analysis/) · [`../04_시각화_visualization`](../04_시각화_visualization/))과 기획·설계 산출물([`../05_기획_product`](../05_기획_product/))을 하나의 20분 발표로 엮은 자료입니다.
**"데이터로 근거를 만든 PM"** 을 주제로, 거시 시장 분석 → 미시 사용자 분석 → 제품 기획·설계까지의 흐름을 담았습니다.

## 📂 템플릿·버전 구조

발표자료는 **출력 형식(pptx)** 과 **HTML 웹덱 2개 템플릿**으로 구성됩니다. 빌드 결합도(빌드 스크립트가 `assets/`를 입력으로 읽고, 웹덱이 상대경로로 자산 참조)가 있어 폴더는 형식·템플릿 단위로 **그대로 유지**합니다.

| 구분 | 위치 | 테마 / 버전 | 상태 |
|------|------|-------------|------|
| **PPTX 산출물** | `KOKKOK_EV_발표자료.pptx` · `.pdf` | 기본 | 최종본 |
| **PPTX(네이버 테마)** | `KOKKOK_EV_NAVER테마.pptx` | NAVER 테마 | `build_naver.js` 생성 |
| **HTML 덱 ① 현대 테마** | [`web_hyundai/`](web_hyundai/) | Hyundai 스타일 | 초기 버전 |
| **HTML 덱 ② 네이버 테마** | [`web_naver/`](web_naver/) | NAVER 통합보고서 스타일 | **최신 정본** (62슬라이드 · D3 15종) |
| **빌드 도구** | `build.js` · `build_naver.js` · `recolor_naver.py` | — | pptxgenjs 기반 |
| **공유 자산** | `assets/` | — | 차트([`../04_시각화_visualization/charts`](../04_시각화_visualization/charts/) 복사본) + `deliverables/` |

> 각 HTML 템플릿은 자체 `assets/`·`css/`·`index.html`을 가진 독립 덱입니다. 두 템플릿은 같은 내용의 디자인 변형이며, 제출·발표 기준은 **`web_naver`(최신 정본)** 입니다.

## 산출물

| 파일 | 내용 |
|------|------|
| `KOKKOK_EV_발표자료.pptx` | 최종 발표자료 (45장) — PowerPoint / Google Slides |
| `KOKKOK_EV_발표자료.pdf` | PDF 미리보기 |
| `build.js` | 발표자료 생성 스크립트 (pptxgenjs) |
| `assets/` | 분석 차트(`../04_시각화_visualization/charts` 복사본) + 산출물 이미지(`deliverables/`) |

## 구조 (45장)

```
1 타이틀 · 2 목차 · 3 프로젝트 개요
[Ch01 시장 분석]      PEST · TAM-SAM-SOM · 경쟁사 분석 ①②
[Ch02 문제 정의]      ‘데이터로 근거를’ 핵심 가설
[Ch03 데이터 수집·분석] 멀티채널 아키텍처 · 수집 현황 · 다국어 전처리 · 분석 ①~④ · 핵심 인사이트 · HW 이슈 · 고객 페르소나
[Ch04 제품 기획·설계]  단계 구조 · 산출물 묶음 · 인사이트→기능 · 포지셔닝 · PRD(MoSCoW) · 사용자 여정맵 · Flow · OCPP · 요금정책
[Ch05 기대효과 & 회고] KPI · 시장 진입 전략 · 회고
마무리 · [부록] 단계별 산출물 8종
```

## 빌드 방법

```bash
cd presentation
npm install          # pptxgenjs (node_modules는 git 제외)
node build.js        # → KOKKOK_EV_발표자료.pptx 생성
```

PDF·이미지 변환(선택, LibreOffice + poppler 필요):

```bash
soffice --headless --convert-to pdf KOKKOK_EV_발표자료.pptx
pdftoppm -jpeg -r 120 KOKKOK_EV_발표자료.pdf slide   # 슬라이드별 이미지(검수용)
```

## 산출물 이미지(`assets/deliverables/`)

OCPP 명세서·ERD·알고리즘 순서도·시퀀스 다이어그램은 실제 파일이 삽입되어 있고,
DB 구조 설계·시나리오·스토리보드·프로토타입은 파일 추가 시 자동 삽입되도록 placeholder로 구성되어 있습니다.
(`build.js`의 `DELIV()` 함수가 `del_<name>.png|jpg` 를 자동 탐지)

> 📌 수정은 `build.js`에서 하고 다시 빌드합니다. PowerPoint에서 직접 편집한 내용은 재빌드 시 덮어써집니다.

---

## web_naver — HTML 발표 덱 + PDF (버전 동기화)

`web_naver/`는 NAVER 통합보고서 스타일로 제작한 **HTML 발표 덱**(62슬라이드, D3 시각화 15종)입니다. HTML이 정본(single source of truth)이며, **PDF는 HTML에서 생성**해 동일하게 버전 관리합니다.

| 파일 | 내용 |
|------|------|
| `web_naver/kokkok-ev-presentation.html` | **HTML 덱(정본)** — 발표/편집용 |
| `web_naver/kokkok-ev-presentation.pdf` | HTML에서 생성한 PDF (배포·인쇄용) |
| `web_naver/build-pdf.sh` | HTML → PDF 빌드 스크립트 |

**버전 동기화 원칙** — HTML을 수정하면 **반드시 PDF를 재생성해 함께 커밋**합니다.

```bash
cd presentation/web_naver
./build-pdf.sh          # ?print=1 모드로 헤드리스 Chrome 인쇄 → 이미지 다운샘플 압축
git add kokkok-ev-presentation.html kokkok-ev-presentation.pdf
git commit              # HTML·PDF 동일 커밋
```

- 빌드 의존성: Google Chrome(헤드리스 인쇄) · ghostscript(`brew install ghostscript`, 이미지 압축·생략 가능)
- PDF는 모든 슬라이드를 1280×720 한 페이지씩 출력(`@media print`), 각 슬라이드 nav는 자기 챕터로 고정(`?print=1`)
