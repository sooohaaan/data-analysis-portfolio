# 04. 시각화 (Visualization)

> **검토 포인트** — "어떻게 시각화했는가". 분석 결과를 어떤 차트·대시보드로 표현해 의사결정에 쓰일 형태로 만들었는가.

분석([`03. 분석`](../03_분석_analysis/)) 결과를 정적 차트 20종과 Tableau 워크북으로 시각화했습니다. 각 차트가 답하는 질문과 근거 데이터(노트북·리포트)를 함께 표기합니다.

## 차트 (`charts/`)

### 앱 리뷰 VOC — 근거: [`01_app_store_scraper`](../02_수집_collection/notebooks/01_app_store_scraper.ipynb) · [`09_review_reclassification`](../03_분석_analysis/notebooks/09_review_reclassification.ipynb)
| 차트 | 답하는 질문 |
|------|-------------|
| `01_complaint_categories.png` | 불만이 어떤 카테고리에 몰리는가 |
| `02_sentiment_by_app.png` | 앱별 감성(긍/부정) 분포 차이 |
| `03_monthly_trend.png` | VOC·감성의 월별 추세 |
| `04_wordcloud_negative_en.png` | 부정 리뷰의 핵심 키워드(영어) |
| `05_rating_distribution.png` | 별점 분포 |
| `10_app_positioning_map.png` | 앱 포지셔닝맵 |
| `11_app_competitive_analysis.png` | 앱 경쟁 분석 |
| `12_wordcloud_vi.png` / `13_wordcloud_th.png` | 베트남어·태국어 키워드 |
| `18_complaint_2layer.png` | 불만 2계층(도메인) 재분류 분포 |

### 하드웨어 — 근거: [`04_hardware_news_scraper`](../02_수집_collection/notebooks/04_hardware_news_scraper.ipynb)
| 차트 | 답하는 질문 |
|------|-------------|
| `06_hw_sentiment_by_category.png` | 하드웨어 카테고리별 감성 |
| `07_hw_keyword_categories.png` | 하드웨어 키워드 분류 |
| `08_hw_sentiment_by_country.png` | 국가별 하드웨어 감성 |
| `09_hw_failure_wordcloud.png` | 고장·불량 키워드 |
| `14_hw_positioning_map.png` | 하드웨어 포지셔닝맵 |
| `15_hw_competitive_analysis.png` | 하드웨어 경쟁 분석 |
| `16_hw_wordcloud_multilang.png` | 다국어 하드웨어 키워드 |

### 연계 · 라오스 시장
| 차트 | 답하는 질문 | 근거 |
|------|-------------|------|
| `17_app_hw_linkage.png` | 앱 불만 ↔ 하드웨어 이슈 연계 | 앱·HW 분석 종합 |
| `19_laos_share_of_voice.png` | 라오스 뉴스 Share of Voice | [`10_laos_news_collection`](../02_수집_collection/notebooks/10_laos_news_collection.ipynb) |
| `20_laos_news_trend.png` | 라오스 뉴스 노출 추세 | 〃 |

## Tableau (`tableau/`)

| 파일 | 내용 |
|------|------|
| `kokkok_ev_analysis.twb` | 메인 분석 워크북 — 포지셔닝맵·경쟁분석 |
| `tableau_queries.sql` | 워크북이 사용하는 추출 쿼리 |
| `coconutcilo.twb` / `문서1.twb` | 보조·작업용 워크북 |

> **재현성 참고** — 정적 차트(png)는 가독성을 위해 분석 노트북과 분리해 이 폴더에 모았습니다. 각 차트의 근거 노트북·리포트는 위 표에 명시했으며, 데이터 원본은 [`02. 수집`](../02_수집_collection/) · 분석 맥락은 [`03. 분석`](../03_분석_analysis/) 에서 확인할 수 있습니다.
