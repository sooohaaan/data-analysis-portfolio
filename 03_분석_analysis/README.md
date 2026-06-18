# 03. 데이터 분석 (Analysis)

> **검토 포인트** — "어떻게 분석했는가". 수집한 VOC를 어떤 전처리·분류·분석 방법으로 인사이트로 전환했는가.

> 📑 전체 파이프라인 요약은 [프로젝트 종합 결과서](../프로젝트_종합_결과서.md) 참고.

수집한 멀티채널 VOC를 다국어 전처리(감성 분석·키워드 분류) 후, 분석 질문별로 정리했습니다. 감성 분석은 **XLM-RoBERTa**로 번역 없이 100개 언어를 직접 처리했습니다. (CRISP-DM의 *데이터 준비·모델링* 단계)

## 분석/전처리 노트북 (`notebooks/`)

| 노트북 | 내용 |
|--------|------|
| [`09_review_reclassification`](notebooks/09_review_reclassification.ipynb) | VOC 2계층 재분류 — 불만 카테고리를 도메인 기준으로 재분리. 시각화: [`18_complaint_2layer.png`](../04_시각화_visualization/charts/18_complaint_2layer.png) |

## 분석 리포트 (`reports/`)

| 리포트 | 분석 질문 |
|--------|-----------|
| [`data_analysis_report.md`](reports/data_analysis_report.md) | 앱 리뷰 VOC 종합 — 불만 카테고리·앱별 감성·월별 트렌드·Pain Point |
| [`market_research_report.md`](reports/market_research_report.md) | 시장 리서치 종합 — 앱·하드웨어·경쟁 분석 결과 통합 |
| [`competitor_pricing_and_market_share.md`](reports/competitor_pricing_and_market_share.md) | 경쟁사 충전 단가·시장 점유율 비교 |
| [`laos_official_stats_analysis.md`](reports/laos_official_stats_analysis.md) | 라오스 공식통계(LSB) 분석 — 차량·시장 규모 |
| [`laos_market_share_of_voice.md`](reports/laos_market_share_of_voice.md) | 라오스 뉴스 Share of Voice — VinFast·Xanh SM·LOCA·KOKKOK 노출 비교 |
| [`laos_ev_charging_situation_analysis.md`](reports/laos_ev_charging_situation_analysis.md) | 라오스 EV 충전 현황 — 시장·정책·서비스 현황 |

## 분석 결과의 시각화·기획 연결

- 분석 결과의 **차트·대시보드** → [`04. 시각화`](../04_시각화_visualization/)
- 분석 인사이트의 **프로덕트 전환(PRD·정책)** → [`05. 기획`](../05_기획_product/)
