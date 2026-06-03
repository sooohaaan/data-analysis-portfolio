# 🥥 Kokkok EV — 동남아 EV 충전 서비스 기획 포트폴리오

> **"데이터로 근거를 만든 PM"**
> 라오스·베트남 EV 충전 시장의 실제 VOC를 멀티채널로 수집·분석하고,
> 그 인사이트를 프로덕트 솔루션으로 연결하는 엔드투엔드 데이터 기반 기획 프로젝트입니다.

---

## 📌 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | 코코넛사일로 Kokkok EV 서비스 기획 |
| **팀원** | 마수한(Data Engineer & PM), 김재희(Data Analyst & PM) |
| **분석 대상 시장** | 라오스, 베트남 EV 충전 서비스 |
| **주요 분석 앱** | LOCA EV (라오스), Green SM (라오스), V-Green (베트남) |
| **데이터베이스** | PostgreSQL (Supabase Cloud) |
| **최종 발표일** | 2026-06-19 |

---

## 🗺️ 프로젝트 아키텍처

```
멀티채널 VOC 수집
├── 앱스토어 리뷰   (google-play-scraper / app-store-scraper)
├── 유튜브           (YouTube Data API v3 / youtube-transcript-api)
├── SNS              (Meta Graph API — Facebook/Instagram)
└── 블로그           (BeautifulSoup — 네이버 블로그)
         │
         ▼
PostgreSQL (Supabase)
         │
         ▼
다국어 전처리 파이프라인
├── 언어 감지        (langdetect)
├── 일괄 번역        (Google Translate API → translated_content)
└── 감성 분석        (XLM-RoBERTa → sentiment_label)
         │
         ▼
SQL 기반 데이터 분석
├── 불만 키워드 카테고리화
├── 월별 트렌드 분석
└── 앱/서비스별 취약점 비율 비교
         │
         ▼
시각화 & 서비스 기획
├── Tableau 인터랙티브 대시보드
├── Python (Matplotlib / Seaborn)
└── PRD + 와이어프레임 (Figma)
```

---

## 📊 데이터 수집 범위

| 구분 | 소스 | 대상 | 담당 |
|------|------|------|------|
| 앱스토어 리뷰 | Google Play / App Store | LOCA EV, Green SM (라오스), V-Green (베트남) | 마수한 |
| 유튜브 | 댓글 + 자막(캡션) | 라오스·베트남·한국 EV 관련 영상 | 마수한 |
| SNS | Facebook (공개 페이지) | LOCA EV, Green EV (라오스·베트남) | 김재희, 마수한 |
| SNS | Instagram | 한국인 라오스 여행객 EV 리뷰 | 김재희, 마수한 |
| 블로그 | 네이버 블로그 | 한국인 라오스 여행객 충전 경험 | 김재희, 마수한 |
| 현지 리서치 | 직접 조사 | 라오스·인접국 EV 충전 서비스 현황 | 김재희, 마수한 |

> ⚠️ **Facebook 수집 주의**: Meta ToS 위반 방지를 위해 Selenium 대신 Meta Graph API(공개 페이지 토큰)를 우선 사용합니다. 수집 불가 시 유튜브·블로그 데이터로 보완합니다.

---

## 🗄️ DB 스키마 (ERD 요약)

```sql
-- 앱스토어 리뷰
app_reviews (id, store, app_name, country, rating, review_date,
             content, translated_content, sentiment_label)

-- 유튜브 영상
youtube_videos (video_id, title, channel, upload_date)

-- 유튜브 댓글
youtube_comments (id, video_id FK, author, content, likes)

-- 유튜브 자막 (STT)
youtube_stt (id, video_id FK, timestamp, content, translated_content)

-- SNS 게시물
sns_posts (id, platform, country, content, post_date, translated_content)

-- 블로그 포스트
blog_posts (id, platform, country, title, content, post_date)
```

---

## 🔄 5단계 실무 프로세스

### Phase 1. 인프라 세팅 및 DB 스키마 설계
- Supabase Cloud PostgreSQL 인스턴스 생성 (`laos-ev-voc-db`) ✅
- ERD 및 스키마 설계 ✅
- DDL 실행 (테이블 생성) ✅

### Phase 2. 데이터 수집 파이프라인 구축
- 앱스토어 스크래퍼 (Python) → DB 자동 적재 🔄
- YouTube Data API v3 댓글·자막 수집 🔄
- SNS / 네이버 블로그 보조 수집 🔄

### Phase 3. 다국어 전처리
- 텍스트 클리닝 (이모티콘 제거, 중복/광고 필터링)
- 언어 감지(`langdetect`) → Google Translate API → `translated_content` 저장
- 이후 모든 분석은 **영어 기준** 진행 (라오어는 spaCy·NLTK 미지원)

### Phase 4. SQL 기반 데이터 분석
1. **Unhappy Path 분석**: 별점 1~2점 리뷰 키워드 카테고리화
2. **트렌드 분석**: 월별 불만 건수 추이, 앱별 취약점 비율
3. **감성 분석**: XLM-RoBERTa 모델로 긍/부정/중립 자동 레이블링 → 별점 교차 검증

### Phase 5. 프로덕트 기획 연계 & 포트폴리오화
- 데이터 기반 PRD 작성 (충전 세션 자동 복구, 오프라인 RFID 결제 등)
- Tableau 인터랙티브 대시보드 + Python 차트 시각화
- Figma 화면 설계 및 Figma Make 프로토타입

---

## 📅 WBS 일정

| 단계 | 기간 | 상태 |
|------|------|------|
| 데이터 수집 파이프라인 구축 | 2026-05-31 ~ 2026-06-03 | 🔄 진행중 |
| 데이터 전처리 | 2026-06-04 ~ 2026-06-06 | ⏳ 예정 |
| 데이터 분석 (포지셔닝맵, 경쟁분석, 감성분석 등) | 2026-06-07 ~ 2026-06-09 | ⏳ 예정 |
| 시각화 (Tableau + Python) | 2026-06-09 ~ 2026-06-12 | ⏳ 예정 |
| 데이터 분석 결과서 취합 | 2026-06-13 ~ 2026-06-14 | ⏳ 예정 |
| 서비스 기획 문서 (시장분석, 시나리오, 정책안, 화면설계) | 진행중 | 🔄 진행중 |
| 발표 자료 (Google Slides → HTML/CSS/JS 최종안) | 2026-06-13 ~ 2026-06-18 | ⏳ 예정 |
| 최종 발표 | 2026-06-19 | 📌 확정 |

---

## 🔍 주요 분석 항목

| 분석 | 도구 | 내용 |
|------|------|------|
| 포지셔닝 맵 | Tableau | 경쟁사 대비 서비스 포지션 시각화 |
| 경쟁 분석 | Tableau | LOCA EV vs Green SM vs V-Green 비교 |
| 워드클라우드 | Python (wordcloud) | 불만 키워드 빈도 상위 30개 |
| 감성 분석 | XLM-RoBERTa | 리뷰 긍/부정/중립 자동 레이블링 |
| 키워드 카테고리 | SQL | 결제오류 / 연결실패 / UI불편 / 충전속도 / 앱오류 |
| 불만 트렌드 | SQL + Python | 월별 불만 건수 추이, 앱별 취약점 비율 |

---

## 📁 서비스 기획 문서 현황

| 문서 | 상태 |
|------|------|
| 충전기 하드웨어 업체 스펙 비교 (Costel, nancome) | ✅ 완료 |
| OCPP 리서치 | ✅ 완료 |
| EV 충전기 제조사별 서비스 시나리오 및 동작 비교 | ✅ 완료 |
| 하드웨어 인프라 시나리오 | ✅ 완료 |
| 라오스 현지 EV 충전 서비스 현황 분석 | 🔄 진행중 |
| 충전 요금 정책안 | 🔄 진행중 |
| 화면설계서 (앱) — Figma | 🔄 진행중 |
| ERD (kokkok EV 서비스) | 🔄 진행중 |
| 프로세스 Flow Chart (COSTEL OCPP) | 🔄 진행중 |

---

## 🛠️ 기술 스택

**데이터 수집**
```
google-play-scraper · app-store-scraper
YouTube Data API v3 · youtube-transcript-api
Meta Graph API · requests · BeautifulSoup
```

**데이터 저장**
```
PostgreSQL (Supabase Cloud)
psycopg2 · SQLAlchemy · pandas
```

**전처리 & 분석**
```
langdetect · googletrans (Google Translate API)
transformers (XLM-RoBERTa) · HuggingFace
SQL (GROUP BY, COUNT, Window Functions)
```

**시각화**
```
Tableau Desktop
Matplotlib · Seaborn
```

**서비스 기획**
```
Figma (화면설계) · Figma Make (프로토타입)
```

---

## 👥 역할 분담

| 역할 | 이름 | 담당 업무 |
|------|------|-----------|
| **Data Engineer & PM** | 마수한 | 인프라 구축, ERD/스키마 설계, 크롤링 파이프라인 개발(앱스토어·유튜브·블로그), 언어 감지·번역 파이프라인, 감성 분석 모델 적용, PRD·기능 명세서 작성, Figma 화면설계 |
| **Data Analyst & PM** | 김재희 | 데이터 정제 및 번역 검수(라오어·베트남어), SNS 데이터 수동 보완, SQL 쿼리 분석, VOC 카테고리 태깅, Tableau 시각화, 유저 시나리오 분석, ERD(서비스 DB) |

---

## ⚠️ 기술적 고려사항

- **라오어 NLP**: spaCy·NLTK 미지원 언어 → `langdetect` 감지 후 Google Translate API로 영어 변환하여 분석
- **YouTube 자막**: 라오스 현지 영상은 자동 자막 없거나 품질 낮을 수 있음 → 수집 가능 영상 사전 목록화 필요
- **Facebook 수집**: Selenium 크롤링은 Meta ToS 위반 소지 → Meta Graph API 우선, 불가 시 다른 소스로 대체
- **앱 리뷰 볼륨**: LOCA EV 등 현지 앱은 리뷰 수 적을 수 있음 → 수집 전 볼륨 사전 검증 필수
