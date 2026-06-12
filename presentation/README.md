# 🎤 presentation — KOKKOK EV 발표자료

데이터 분석(`../outputs`, `../notebooks`)과 기획·설계 산출물(`../docs`)을 하나의 20분 발표로 엮은 자료입니다.
**"데이터로 근거를 만든 PM"** 을 주제로, 거시 시장 분석 → 미시 사용자 분석 → 제품 기획·설계까지의 흐름을 담았습니다.

## 산출물

| 파일 | 내용 |
|------|------|
| `KOKKOK_EV_발표자료.pptx` | 최종 발표자료 (45장) — PowerPoint / Google Slides |
| `KOKKOK_EV_발표자료.pdf` | PDF 미리보기 |
| `build.js` | 발표자료 생성 스크립트 (pptxgenjs) |
| `assets/` | 분석 차트(`outputs` 복사본) + 산출물 이미지(`deliverables/`) |

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
