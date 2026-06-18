# 02. 데이터 수집 (Collection)

> **검토 포인트** — "어떻게 수집했는가". 멀티채널 VOC를 어떤 도구·전략으로 수집하고, 수집 중 마주친 문제를 어떻게 해결했는가.

라오스·베트남 EV 충전 시장의 실제 VOC를 5개 채널에서 멀티채널로 수집해 PostgreSQL(Supabase)에 적재했습니다. **총 VOC 38,600+건 · 9개 테이블 · 4개 언어(라·베·태·영/한).**

## 수집 노트북 (`notebooks/`)

| 노트북 | 채널 | 핵심 수집량 / 비고 |
|--------|------|--------------------|
| [`01_app_store_scraper`](notebooks/01_app_store_scraper.ipynb) | 앱스토어 리뷰 (Google Play) | **28,890건** (Green SM 26,603 등). 페이지네이션 한계 → 언어별 5회 전수 수집으로 우회 |
| [`02_youtube_scraper`](notebooks/02_youtube_scraper.ipynb) | 유튜브 (API v3 + 자막) | 영상 21 / 댓글 527 / 자막 2,625 세그먼트 |
| [`03_blog_sns_scraper`](notebooks/03_blog_sns_scraper.ipynb) | 네이버 블로그 · SNS | 블로그 API 수집 |
| [`04_hardware_news_scraper`](notebooks/04_hardware_news_scraper.ipynb) | 하드웨어 관련 뉴스 | 충전 하드웨어 이슈 기사 |
| [`05_superapp_scraper`](notebooks/05_superapp_scraper.ipynb) | 슈퍼앱 리뷰 (Grab·Gojek·LOCA·KOKKOK Move) | **3,370건** — 슈퍼앱 EV 통합 전략 근거 |
| [`06_instagram_hashtag_scraper`](notebooks/06_instagram_hashtag_scraper.ipynb) | 인스타그램 해시태그 (Meta Graph) | 보조·보류 채널 |
| [`07_laos_official_stats`](notebooks/07_laos_official_stats.ipynb) | 라오스 공식 통계(LSB) | 차량 통계 → [`outputs/laos_vehicle_stats.csv`](outputs/laos_vehicle_stats.csv) |
| [`08_reference_stats_loader`](notebooks/08_reference_stats_loader.ipynb) | 참조 통계 적재 | 단가·IR 등 `reference_stats` 테이블 |
| [`10_laos_news_collection`](notebooks/10_laos_news_collection.ipynb) | 라오스 뉴스 (네이버·Google News RSS) | 시장·정책·SoV용 `news_articles` |

> 노트북 `09_review_reclassification`는 **수집이 아니라 분석/전처리**이므로 [`03_분석_analysis`](../03_분석_analysis/) 로 분리했습니다.

## 수집 산출물

- [`lsb_data_acquisition_plan.md`](lsb_data_acquisition_plan.md) — 라오스 공식통계(LSB) 수집 계획 정본
- [`outputs/laos_vehicle_stats.csv`](outputs/laos_vehicle_stats.csv) — 라오스 차량 통계 원천 데이터
- [`exports/`](exports/README.md) — **Supabase DB 9개 테이블 CSV 스냅샷** (약 38,600행). 생성: [`../src/export_db.py`](../src/export_db.py)

## 수집 중 해결한 주요 문제 (상세는 [메인 README](../README.md))

1. **LOCA EV 리뷰 7건뿐** → 통계적 유의성 확보 위해 태국 선도 EV 충전 3개 앱을 비교군으로 추가
2. **Green SM = V-Green 동일 앱 ID** 발견 → `country=MUL` 처리 후 감지 언어로 국가 간접 구분
3. **Google Play 페이지네이션 ~2,000건 제한** → 언어·국가 5개 조합의 독립 토큰 풀로 전수 수집

## 실행 환경

노트북은 `notebooks/` 디렉터리 기준 실행을 전제로 하며, 공용 코드([`../src/`](../src/))·환경변수(`../../.env`)·DB 스키마([`../schema/`](../schema/))를 참조합니다.
