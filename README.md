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
| **분석 대상 시장** | 라오스, 베트남 EV 충전 서비스 (태국 비교군 포함) |
| **주요 분석 앱** | Green SM (라오스·베트남), LOCA EV (라오스), PTT blueplus+ · PEA VOLTA · EleXA (태국 비교군) |
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

| 구분 | 소스 | 대상 | 수집량 | 상태 | 담당 |
|------|------|------|--------|------|------|
| 앱스토어 리뷰 | Google Play | Green SM (라오스·베트남 공용, `com.gsm.customer`) | **26,603건** | ✅ 완료 | 마수한 |
| 앱스토어 리뷰 | Google Play | LOCA EV (라오스, `la.loca.app`) | **7건** | ✅ 완료 (전수) | 마수한 |
| 앱스토어 리뷰 | Google Play | PTT blueplus+ (태국 비교군) | **1,518건** | ✅ 완료 | 마수한 |
| 앱스토어 리뷰 | Google Play | PEA VOLTA (태국 비교군) | **499건** | ✅ 완료 | 마수한 |
| 앱스토어 리뷰 | Google Play | EleXA / EGAT (태국 비교군) | **263건** | ✅ 완료 | 마수한 |
| 유튜브 | YouTube Data API v3 + youtube-transcript-api | EV 충전 관련 영상 (하이브리드 방식) | **영상 21개 / 댓글 527건 / 자막 2,625세그먼트** | ✅ 완료 | 마수한 |
| 블로그 | 네이버 블로그 API | 한국인 라오스 여행객 EV 충전 경험 | **42건** | ✅ 완료 | 마수한 |
| SNS | Facebook (Meta Graph API) | LOCA EV, Green SM 공개 페이지 | - | 🔄 토큰 발급 후 진행 예정 | 김재희, 마수한 |
| SNS | Instagram | 한국인 라오스 여행객 EV 해시태그 | - | 🔄 예정 | 김재희, 마수한 |
| 현지 리서치 | 직접 조사 | 라오스·인접국 EV 충전 서비스 현황 | 별도 문서 | 🔄 진행중 | 김재희, 마수한 |

> ⚠️ **Facebook 수집 주의**: Meta ToS 위반 방지를 위해 Selenium 대신 Meta Graph API(공개 페이지 토큰)를 우선 사용합니다. 수집 불가 시 유튜브·블로그 데이터로 보완합니다.

> 📌 **태국 비교군 추가 배경**: WBS 리서치에서 태국이 동남아 EV 충전 선도 시장으로 확인됨. PTT PluZ(1위)·PEA Volta(4위)·EleXA(EGAT) 리뷰를 수집해 라오스·베트남 서비스와 비교 분석.

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

#### 📱 앱스토어 수집 ✅ 완료 — 총 28,890건

| 앱 | 수집량 | 평균별점 | 저별점(1~2점) | 비고 |
|----|--------|---------|------------|------|
| Green SM | 26,603건 | 2.56⭐ | 15,546건 (58%) | 라오스·베트남 공용 앱, 5개 언어조합 전수 수집 |
| LOCA EV | 7건 | 5.0⭐ | 0건 | 설치 10,000+이나 리뷰 작성 문화 없음 |
| PTT blueplus+ | 1,518건 | 3.11⭐ | 651건 (43%) | 태국 1위 EV 네트워크, WBS 언급 (비교군) |
| PEA VOLTA | 499건 | 2.28⭐ | 323건 (65%) | 태국 4위, WBS 직접 언급 (비교군) |
| EleXA | 263건 | 2.41⭐ | 166건 (63%) | EGAT 태국 국영 전기공사 (비교군) |

**수집 전략:**
- 동일 앱을 언어별 국가 코드(vi·lo·th·en·ko)로 반복 수집하여 전수 확보
- Google Play API는 언어·국가 조합당 약 2,000~3,000건 제한 → 5개 조합으로 우회
- LOCA EV 리뷰 부재 → 태국 비교군 3개 앱(PTT·PEA·EleXA) 추가 수집으로 보완

---

#### 📺 유튜브 수집 ✅ 완료 — 하이브리드 방식

**영상 21개 / 댓글 527건 / 자막(STT) 2,625세그먼트**

유튜브는 앱스토어와 달리 서비스 리뷰가 분산되어 있어 두 방식을 병행했습니다:

| 방식 | 설명 | 수집량 |
|------|------|--------|
| ① **직접 지정** (주력) | WBS 리서치에서 검증한 핵심 영상 6개 직접 ID 지정 | 6개 |
| ② **키워드 검색** (보조) | "LOCA EV charging Laos" 등 3개 쿼리로 추가 발굴 | 15개 |

**주요 수집 영상:**

| 영상 | 자막수 | 핵심 내용 |
|------|--------|----------|
| LOCA EV 리얼 사용기 (`cuFkQBe26mM`) | 686개 | QR 오류, 결제 프로세스, 충전 UX |
| 태국 EV 충전 비교 (`moNqhkSmNNg`) | 528개 | PTT·Elex·SPARK·PEA 5대 네트워크 비교 |
| 베트남 VinFast 충전 (`hArnl8kI7DI`) | 447개 | V-Green 서비스 현황 |
| 라오스 EV 충전 서비스 (`Jja5en9n9pw`) | 216개 | LOCA EV 17개 스테이션 운영 현황 |

**자막 언어 우선순위:** `lo → vi → th → en → ko` (자동 생성 자막 포함)

---

#### 📝 네이버 블로그 수집 ✅ 완료 — 42건

한국인 라오스 여행객의 EV 충전 직접 경험을 담은 블로그 포스트를 수집했습니다.

**수집 전략: 검색 중심 하이브리드**
- 네이버 블로그는 검색 정확도가 높아 키워드 검색이 주력 (유튜브와 반대)
- 검색어에 경험 관련 단어(`후기/리뷰/경험/사용기`)를 필수로 결합하여 실사용 리뷰에 집중
- 14개 검색 쿼리(예: "라오스 전기차 충전 후기", "LOCA EV 후기" 등)

**3단계 필터링 과정:**

| 단계 | 방식 | 결과 | 문제 |
|------|------|------|------|
| 1차 (OR) | EV 관련 키워드 하나라도 포함 | 412건 | 무관련 글 대량 포함 |
| 2차 (AND) | 라오스 + EV 동시 포함 | 335건 | content에 각 단어가 분리 언급되면 통과 |
| **3차 (title AND)** | **title에 '라오스/LOCA' 필수 + 경험단어 필수** | **42건** | 가장 정확 |

> 💡 **한계**: 라오스 EV 충전소를 직접 방문하고 블로그에 기록한 한국인 여행객이 절대적으로 적음. 42건이 수집 가능한 거의 전부이며, 앱스토어·유튜브 데이터가 분석의 핵심 소스.

---

#### 📘 SNS (Facebook / Instagram) 🔄 예정

- Meta Graph API 액세스 토큰 발급 후 진행
- 수집 불가 시 유튜브·블로그 데이터로 대체

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
| 데이터 수집 파이프라인 구축 | 2026-05-31 ~ 2026-06-04 | 🔄 진행중 (앱스토어✅·유튜브✅·블로그✅ 완료, SNS 예정) |
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
| 경쟁 분석 | Tableau | Green SM vs LOCA EV vs PTT blueplus+ vs PEA VOLTA vs EleXA 비교 |
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

## ⚠️ 기술적 고려사항 & 수집 과정 학습

### 데이터 수집 전략별 차이

| 소스 | 특성 | 채택 전략 |
|------|------|---------|
| 앱스토어 | 서비스별 리뷰가 한 곳에 집중 | 앱 ID 직접 지정, 전수 수집 |
| 유튜브 | 서비스 리뷰가 분산됨 | **하이브리드**: 직접 지정(주력) + 키워드 검색(보조) |
| 네이버 블로그 | 검색 정확도 높음 | **검색 중심**: 경험 키워드 결합 검색 + AND 필터링 |
| Facebook/Instagram | ToS 제약 | Meta Graph API 우선 |

### 수집 과정에서 발견한 이슈

- **LOCA EV 리뷰 부재**: 설치 수 10,000+이지만 실제 리뷰 7건. 라오스 현지 앱 특성상 리뷰 작성 문화가 없음. → 태국 비교군 3개 앱 추가로 보완
- **Green SM 다국가 앱**: 라오스·베트남에서 동일 앱 ID(`com.gsm.customer`) 사용. country 컬럼은 `MUL`(Multi)로 처리, 언어 감지로 국가 구분 예정
- **Google Play 페이지네이션 제한**: 언어·국가 조합당 2,000~3,000건 상한 → 5개 언어(vi/lo/th/en/ko) 조합으로 26,603건 전수 수집
- **youtube-transcript-api 버전 변경**: 신버전에서 `list_transcripts()` → 인스턴스 메서드 `api.list()` / `api.fetch()`로 변경됨
- **Supabase 연결 리전**: 프로젝트가 Singapore(ap-southeast-1) 리전에 있어 Seoul(ap-northeast-2) pooler 사용 시 접속 실패. Session Pooler(`aws-1-ap-southeast-1`, port 5432)로 전환
- **네이버 블로그 한계**: "라오스 EV 충전 경험"을 한국어로 기록한 블로그가 절대적으로 적음. 3단계 필터링(OR → AND → title AND + 경험단어) 끝에 42건 확보. 앱스토어·유튜브가 핵심 소스

### 필터링 전략 (네이버 블로그)

```python
# 최종 채택 필터 — 3중 AND 조건
# title에 반드시 포함:
#   ① 라오스/LOCA/비엔티안 계열 단어
#   ② 전기차/EV/충전 관련 단어  
#   ③ 후기/리뷰/경험/사용기 계열 단어
# 예외: "LOCA EV"가 title에 있으면 ③ 면제

has_laos = any(kw in title for kw in ['라오스', 'loca', '비엔티안'])
has_ev   = any(kw in text  for kw in ['전기차', 'ev', '충전', ...])
has_exp  = any(kw in text  for kw in ['후기', '리뷰', '경험', '사용기', ...])
return has_laos and has_ev and has_exp
```

### 소스별 분석 활용도

| 소스 | 수집량 | 분석 활용도 | 역할 |
|------|--------|------------|------|
| 앱스토어 (5개 앱) | **28,890건** | ⭐⭐⭐ 핵심 | 정량 분석, 키워드 카테고리화, 감성 분석 |
| 유튜브 자막 | **2,625세그먼트** | ⭐⭐⭐ 핵심 | 실사용 맥락 파악, 시나리오 복기 |
| 유튜브 댓글 | **527건** | ⭐⭐ 보조 | 사용자 반응 및 감성 |
| 네이버 블로그 | **42건** | ⭐ 참고 | 한국인 시각, 질적 인사이트 |
| Facebook / Instagram | - | ⭐ 참고 | SNS 여론 (수집 예정) |
