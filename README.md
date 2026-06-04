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
| **분석 대상** | 라오스·베트남 EV 충전 서비스 (태국 비교군 포함) |
| **주요 분석 앱** | Green SM, LOCA EV, PTT blueplus+, PEA VOLTA, EleXA |
| **데이터베이스** | PostgreSQL (Supabase Cloud — `laos-ev-voc-db`) |
| **최종 발표일** | 2026-06-19 |

---

## 🗺️ 프로젝트 아키텍처

```
멀티채널 VOC 수집                    Market Intelligence 수집
├── 앱스토어 리뷰 (Google Play)       └── 뉴스 기사 (네이버·Google News)
├── 유튜브 (API v3 + 자막)
├── 네이버 블로그 (API)
└── SNS (Meta Graph API — 예정)
              │
              ▼
    PostgreSQL / Supabase Cloud
    ┌─ VOC 테이블 6개 ──────────────┐
    │  app_reviews / youtube_* /   │
    │  sns_posts / blog_posts       │
    └───────────────────────────────┘
    ┌─ Market Intel 테이블 1개 ─────┐
    │  news_articles                │
    └───────────────────────────────┘
              │
              ▼
    Phase 3. 다국어 전처리
    ├── 언어 감지 (langdetect)
    ├── 감성 분석 (XLM-RoBERTa — 번역 없이 100개 언어 직접 처리)
    ├── 키워드 카테고리 분류 (규칙 기반)
    └── 선택적 번역 (googletrans — 필요 시만)
              │
              ▼
    Phase 4. 데이터 분석
    ├── 불만 카테고리 정량화 (앱오류 35%, 결제오류 8.2%)
    ├── 감성 분포 (Negative 53.5%)
    ├── 월별 트렌드 분석
    └── 워드클라우드 / 앱별 비교
              │
              ▼
    Phase 5. 프로덕트 기획
    ├── PRD — 앱 레이어 6개 + 하드웨어 레이어 5개 = 총 11개 기능
    ├── Figma 화면설계 / Figma Make 프로토타입
    └── Tableau 인터랙티브 대시보드 (예정)
```

---

## 🗄️ DB 스키마 (7개 테이블)

**VOC 데이터** (사용자 경험 — 감성 분석·키워드 분류 대상)
```sql
app_reviews      (id, store, app_name, country, rating, content,
                  lang_detected, translated_content, sentiment_label,
                  sentiment_score, keyword_category)
youtube_videos   (video_id PK, title, channel_name, country, upload_date, view_count, like_count)
youtube_comments (id, video_id FK, author, content, lang_detected,
                  translated_content, sentiment_label, keyword_category)
youtube_stt      (id, video_id FK, timestamp_start, timestamp_end,
                  content, translated_content)
sns_posts        (id, platform, page_name, country, content,
                  translated_content, collection_method)
blog_posts       (id, platform, title, content, author, post_date, url,
                  lang_detected, translated_content, sentiment_label)
```

**Market Intelligence** (시장·정책·하드웨어 정보 — VOC와 목적이 달라 분리)
```sql
news_articles    (id, source, publisher, title, content, url,
                  published_date, country, category,
                  lang_detected, translated_content,
                  sentiment_label, sentiment_score, keyword_category)
-- source: naver_news | google_news
-- category (VOC 뉴스): policy | market | infrastructure | company | other
-- category (하드웨어):  hardware_protocol | hardware_manufacturer |
--                       hardware_failure | hardware_infrastructure | hardware_market
```

> 📌 **테이블 분리 이유**: VOC는 "무엇이 불편한가?"를 파악하는 데이터,
> 뉴스는 "시장·정책이 어떻게 움직이는가?"를 파악하는 데이터로 분석 목적이 다름.
> 같은 테이블에 혼재하면 분석 쿼리가 복잡해지므로 처음부터 분리 설계.

---

## 🔄 5단계 실무 프로세스 — 진행 현황

---

### ✅ Phase 1. 인프라 세팅 및 DB 스키마 설계 — 완료

| 작업 | 상태 | 비고 |
|------|------|------|
| Supabase Cloud PostgreSQL 인스턴스 생성 | ✅ | `laos-ev-voc-db` (Singapore 리전) |
| ERD 설계 (erdcloud.com) | ✅ | 7개 테이블, FK 관계 설정 |
| DDL 실행 (테이블 생성) | ✅ | `schema/create_tables.sql` |

**⚠️ 초기 계획과 달라진 점**

**① news_articles 테이블 추가 (6개 → 7개)**

처음에는 뉴스 기사를 `blog_posts` 테이블에 `platform='naver_news'` 형태로 함께 저장하려 했습니다. 그러나 실제 수집을 시작하며 두 데이터의 목적이 근본적으로 다르다는 것을 인식했습니다.

```
blog_posts    → "사용자가 직접 경험하고 쓴 글" → 감성 분석, Pain Point 파악
news_articles → "언론이 보도한 시장·정책 정보" → 시장 현황, PRD 근거 확보

같은 테이블에 혼재하면 분석 쿼리가 복잡해지고
"사용자 경험"과 "시장 정보"를 혼동할 위험이 있음
→ 별도 테이블(news_articles)로 분리 설계
```

**② blog_posts·news_articles 컬럼 누락 (ALTER TABLE로 추가)**

스키마 설계 시 `blog_posts`에 `lang_detected` 컬럼을 빠뜨렸고, `news_articles`에는 `sentiment_label` 컬럼이 없었습니다. 전처리 코드를 실행했을 때 `column "lang_detected" does not exist` 오류가 발생하며 처음 발견했습니다.

```sql
-- 실행 중 오류 발생 후 즉시 추가
ALTER TABLE blog_posts     ADD COLUMN IF NOT EXISTS lang_detected VARCHAR(10);
ALTER TABLE blog_posts     ADD COLUMN IF NOT EXISTS translated_content TEXT;
ALTER TABLE news_articles  ADD COLUMN IF NOT EXISTS sentiment_label VARCHAR(10);
ALTER TABLE news_articles  ADD COLUMN IF NOT EXISTS sentiment_score FLOAT;
```

> 교훈: 처음 스키마 설계 시 전처리·분석 단계에서 필요한 컬럼을 미리 예상해 포함해야 합니다. `IF NOT EXISTS`를 사용하면 중복 실행에도 안전합니다.

---

### ✅ Phase 2. 데이터 수집 파이프라인 구축 — 대부분 완료

#### 📱 앱스토어 리뷰 수집 — 총 28,890건

| 앱 | Google Play ID | 수집량 | 평균별점 | 저별점(1~2점) | 비고 |
|----|----------------|--------|---------|------------|------|
| Green SM | `com.gsm.customer` | **26,603건** | 2.56⭐ | 15,546건 (58%) | 라오스·베트남 공용 앱 |
| LOCA EV | `la.loca.app` | **7건** | 5.0⭐ | 0건 | 전수 수집 (리뷰 없음) |
| PTT blueplus+ | `com.pttor.xplore` | **1,518건** | 3.11⭐ | 651건 (43%) | 태국 비교군 |
| PEA VOLTA | `com.pea.peavolta` | **499건** | 2.28⭐ | 323건 (65%) | 태국 비교군 |
| EleXA | `egat.smd.ev` | **263건** | 2.41⭐ | 166건 (63%) | 태국 비교군 |

**⚠️ 초기 계획과 달라진 점**

| 항목 | 최초 계획 | 실제 결과 | 변경 이유 |
|------|----------|---------|---------|
| 수집 앱 수 | 3개 (LOCA EV, Green SM, V-Green) | **5개** (+ PTT·PEA·EleXA 태국 비교군) | 아래 상세 설명 참조 |
| Green SM / V-Green 구분 | 별도 앱으로 취급 | **동일 앱 ID** `MUL` 처리 | 아래 상세 설명 참조 |
| 수집 방식 | 단순 `count=500` 1회 | **언어별 5회 반복** 전수 수집 | 아래 상세 설명 참조 |

**① LOCA EV 리뷰 부재 → 태국 비교군 추가**

LOCA EV(`la.loca.app`)는 Google Play에 설치 10,000+으로 등록되어 있어 충분한 리뷰가 있을 것으로 예상했습니다. 그러나 실제 수집 결과 단 **7건**뿐이었습니다.

```python
# 수집 시도 결과
result = reviews('la.loca.app', lang='lo', country='la', count=200)
print(len(result))  # → 3건

result = reviews('la.loca.app', lang='en', country='us', count=200)
print(len(result))  # → 0건
# 라오스·태국·영어 모든 조합 → 합계 7건
```

라오스 현지 앱 특성상 사용자들이 리뷰를 남기는 문화가 없었습니다. 분석에 최소 수백 건 이상이 필요한 상황에서 7건은 통계적 유의성이 없어 단독 분석이 불가능했습니다.

**해결**: WBS 리서치에서 이미 언급한 태국 선도 EV 충전 네트워크 3개를 비교군으로 추가 수집. 태국은 동남아 EV 충전 선도 시장이므로 라오스·베트남과의 비교 분석에도 유의미합니다.

---

**② Green SM = V-Green 동일 앱 발견**

처음 계획에서는 Green SM(라오스)과 V-Green(베트남)을 별도 앱으로 파악하고 각각 수집하려 했습니다. 그러나 WBS 데이터수집 시트에 기재된 V-Green URL을 확인하니 앱 ID가 동일했습니다.

```
V-Green Google Play URL:
https://play.google.com/store/apps/details?id=com.gsm.customer

Green SM Google Play ID:
com.gsm.customer  ← 동일!

→ 라오스와 베트남에서 같은 앱을 서로 다른 이름으로 운영
```

**해결**: 동일 앱을 두 번 수집하는 중복을 방지하고, `country` 컬럼에 `MUL`(Multi-country)을 입력. 이후 `lang_detected`로 감지된 언어(vi=베트남어, lo=라오어)로 국가를 간접 구분합니다.

---

**③ Google Play API 페이지네이션 제한 우회**

처음에는 단순히 `count=500`으로 한 번만 수집했습니다. 그런데 실제로는 2,000건을 넘지 못하고 멈추는 현상이 발생했습니다.

```python
# ❌ 시도한 방식 (최대 2,000~3,000건에서 멈춤)
result, _ = reviews('com.gsm.customer', lang='auto', country='us', count=9999)
print(len(result))  # → 2,325건 (26만 건 있는데 여기서 멈춤)
```

Google Play Scraper는 언어·국가 조합당 최대 약 2,000~3,000건의 `continuation_token`을 제공합니다. 토큰이 소진되면 더 이상 수집이 불가능합니다.

**해결**: 언어·국가 조합을 5개로 달리하여 각각 독립적인 토큰 풀에서 수집.

```python
# ✅ 해결 방식 — 언어별로 별도 수집
CONFIGS = [
    {'country': 'vn', 'lang': 'vi'},  # 베트남어 리뷰 풀
    {'country': 'la', 'lang': 'lo'},  # 라오어 리뷰 풀
    {'country': 'th', 'lang': 'th'},  # 태국어 리뷰 풀
    {'country': 'us', 'lang': 'en'},  # 영어 리뷰 풀
    {'country': 'kr', 'lang': 'ko'},  # 한국어 리뷰 풀
]
# 각 조합에서 독립적으로 수집 → 합계 26,603건
```

---

#### 📺 유튜브 수집 — 영상 21개 / 댓글 527건 / 자막 2,625세그먼트

**수집 전략: 하이브리드 방식**

| 방식 | 설명 | 수량 | 우선순위 |
|------|------|------|---------|
| ① 직접 지정 | WBS 리서치에서 검증한 핵심 영상 ID 직접 입력 | 6개 | 주력 |
| ② 키워드 검색 | API로 추가 영상 자동 발굴 | 15개 | 보조 |

**핵심 수집 영상 (직접 지정)**

| 영상 | 자막수 | 핵심 분석 내용 |
|------|--------|--------------|
| LOCA EV 리얼 사용기 (`cuFkQBe26mM`) | 686개 | QR 오류, 결제 프로세스, Handshake 실패 |
| 태국 EV 충전 비교 (`moNqhkSmNNg`) | 528개 | PTT·Elex·SPARK·PEA 5대 네트워크 비교 |
| 베트남 VinFast 충전 (`hArnl8kI7DI`) | 447개 | V-Green 서비스 UX 현황 |
| 라오스 LOCA EV 현황 (`Jja5en9n9pw`) | 216개 | 17개 급속 스테이션, 예약 기능 |
| 라오스 EV 인프라 부재 (`6rw0NJdxgMs`) | 176개 | 이륜차 충전소 없음, 임기응변 충전 |

**⚠️ 초기 계획과 달라진 점**

| 항목 | 최초 계획 | 실제 결과 | 변경 이유 |
|------|----------|---------|---------|
| 수집 방식 | 키워드 검색만 | **하이브리드** (직접 지정 주력 + 검색 보조) | 아래 상세 설명 참조 |
| youtube-transcript-api 호출 방식 | `YouTubeTranscriptApi.list_transcripts()` | **인스턴스 메서드** `api.list()` | 아래 상세 설명 참조 |

**① 유튜브 수집 — 키워드 검색만으로는 무관련 영상 포함**

앱스토어는 앱 ID만 알면 해당 앱의 리뷰만 정확하게 수집할 수 있습니다. 반면 유튜브는 서비스별로 리뷰가 모여있는 단일 페이지가 없어, 처음에는 키워드 검색으로만 접근했습니다.

```python
# ❌ 키워드 검색만 사용 시 문제
results = youtube.search().list(q="LOCA EV charging Laos", ...).execute()
# → 관련 영상뿐 아니라 "Laos travel vlog", "EV review USA" 등 무관련 영상 다수 포함
#   수동으로 걸러내지 않으면 노이즈 데이터 유입
```

**해결**: WBS 리서치 과정에서 이미 직접 시청하고 검증한 영상 6개를 video_id로 직접 지정합니다. 검색은 추가 발굴용 보조 수단으로만 사용합니다.

```python
# ✅ 하이브리드 방식
# ① 직접 지정 (검증된 영상 — 주력)
CURATED = [
    {"video_id": "cuFkQBe26mM", "note": "LOCA EV 리얼 사용기"},
    {"video_id": "6rw0NJdxgMs", "note": "라오스 EV 인프라 부재"},
    ...  # WBS에서 직접 확인한 6개
]
# ② 키워드 검색 (추가 발굴 — 보조)
search_results = youtube.search().list(q="LOCA EV Laos", ...).execute()
# → 두 결과를 합쳐 중복 제거 후 수집 (직접 지정 우선)
```

---

**② youtube-transcript-api 버전 변경으로 인한 오류**

자막 수집 코드를 작성할 때 공식 문서 기준으로 클래스 메서드 방식을 사용했습니다. 그러나 실행 시 오류가 발생했습니다.

```python
# ❌ 구버전 방식 (AttributeError 발생)
from youtube_transcript_api import YouTubeTranscriptApi
tl = YouTubeTranscriptApi.list_transcripts("cuFkQBe26mM")
# → AttributeError: type object 'YouTubeTranscriptApi' has no attribute 'list_transcripts'

# 원인: 설치된 버전이 클래스 메서드를 인스턴스 메서드로 변경함
```

**해결**: 설치된 버전의 실제 API를 확인하고 인스턴스 방식으로 수정했습니다.

```python
# ✅ 신버전 방식
api = YouTubeTranscriptApi()          # 인스턴스 생성
tl  = api.list("cuFkQBe26mM")        # 인스턴스 메서드 호출
transcript = tl.find_transcript(['lo', 'vi', 'en'])
data = transcript.fetch()
```

> 라이브러리는 버전마다 API가 바뀔 수 있습니다. 오류 발생 시 `dir(YouTubeTranscriptApi)`로 실제 메서드 목록을 먼저 확인하는 것이 빠른 디버깅 방법입니다.

---

#### 📝 네이버 블로그 수집 — 42건

**수집 전략: 검색 중심 (유튜브와 반대로 검색이 주력)**

네이버 블로그는 검색 정확도가 높아 키워드 검색이 효과적. 검색어에 "후기/리뷰/경험" 단어를 필수 결합해 실사용 리뷰에 집중.

**3단계 필터링 과정 — 실제로 겪은 시행착오**

| 단계 | 방식 | 결과 | 실패 이유 |
|------|------|------|---------|
| 1차 (OR) | EV 관련 키워드 중 하나라도 포함 | 412건 | "포스코인터내셔널 기업분석"처럼 content에 '전기차' 단어만 나와도 통과 |
| 2차 (AND) | 라오스 + EV 단어 동시 포함 | 335건 | content에 두 단어가 각각 존재하면 통과 → "라오스 여행기"에 전기차 관련 단어가 한 번 언급되면 통과 |
| **3차 (title AND + 경험단어)** | **title에 '라오스/LOCA' 필수 + 경험단어 필수** | **42건** | 가장 정확 |

**필터링 단계별 실패 사례와 이유**

```python
# ❌ 1차 필터 (OR) — 통과하면 안 되는 글이 통과
text = "포스코인터내셔널 기업분석: 에너지를 품은 종합상사"
# content 어딘가에 "전기차" 단어가 1번 등장 → 통과
# 실제로는 라오스나 EV 충전과 무관한 주식 분석 글

# ❌ 2차 필터 (AND) — 여전히 문제
title   = "라오스 꽝시폭포 여행 완벽 가이드"
content = "... 꽝시폭포 가는 길에 전기 오토바이를 빌렸습니다..."
# title에 '라오스' + content에 '전기' → 통과
# 실제 EV 충전 경험 글이 아닌 일반 여행기

# ✅ 3차 필터 (title AND + 경험단어) — 최종 채택
has_laos = any(kw in title for kw in ['라오스', 'loca ev', '비엔티안'])
has_ev   = any(kw in text  for kw in ['전기차', 'ev', '충전', ...])
has_exp  = any(kw in text  for kw in ['후기', '리뷰', '경험', '사용기', ...])
return has_laos and has_ev and has_exp

# title에 세 가지 조건이 모두 있어야 통과
# "라오스 방비엥 전기스쿠터 블루라군 후기" → 통과 ✅
# "라오스 꽝시폭포 여행 완벽 가이드" → 탈락 ✅ (경험단어 없음)
```

> 💡 **근본적 한계**: 라오스 EV 충전소를 직접 방문하고 블로그에 기록한 한국인 여행객 자체가 적음. 42건이 수집 가능한 사실상 전부. 앱스토어·유튜브가 분석 핵심 소스.

---

#### 📰 뉴스 기사 수집 — 733건 ✅ (계획에 없던 추가 항목)

**⚠️ 최초 계획에 없던 항목 — 추가 이유**

당초 계획에는 뉴스 수집이 없었음. 블로그 수집 후 "사용자 경험(VOC) 데이터와 시장/정책 정보가 같은 테이블에 들어가면 분석 목적이 혼재된다"는 문제 인식 → `news_articles` 테이블을 별도로 설계하고 수집 추가.

| 소스 | 수집량 | 언어 |
|------|--------|------|
| 네이버 뉴스 API | 303건 | 한국어 |
| Google News RSS | 430건 | 영어·한국어 |

**카테고리 자동 분류 결과**

| 카테고리 | 건수 | 활용 |
|----------|------|------|
| infrastructure (충전소·인프라) | 184건 | 충전소 구축 현황 |
| market (시장동향) | 162건 | 시장 성장 근거 |
| policy (정책) | 113건 | PRD 정책 근거 |
| company (기업동향) | 81건 | 경쟁사 동향 |

---

#### 📘 SNS (Facebook / Instagram) — 🔄 예정

Meta Graph API 액세스 토큰 미발급으로 보류 중. 수집 불가 시 유튜브·블로그 데이터로 대체.

---

#### 🔧 충전기 하드웨어 뉴스 수집 ✅ 완료 — 1,327건 (계획에 없던 추가 항목)

**⚠️ 최초 계획에 없던 항목 — 추가 이유**

앱 레이어 분석만으로는 "앱오류 35%"의 원인이 앱 버그인지, 충전기 하드웨어와의 통신 문제인지 구분할 수 없었습니다. EV 충전 서비스는 **소프트웨어(앱)** 와 **하드웨어(충전기기)** 두 레이어로 구성되므로 하드웨어 레이어 분석을 추가했습니다.

**수집 대상 제조사**: Costel(코스텔, 한국), OCPP 표준 관련 (Nancome은 데이터 없음)

| 언어 | 건수 | 주요 내용 |
|------|------|---------|
| 한국어 | 430건 | 코스텔 충전기 동향, OCPP 호환성 |
| 영어 | 572건 | OCPP 표준, EV charger failure, 동남아 인프라 |
| 베트남어 | 184건 | 현지 충전기 설치·오류 관련 |
| 태국어 | 135건 | 태국 EV 충전기 품질·연결 문제 |

**하드웨어 뉴스 카테고리 분류 (keyword_category)**

| 카테고리 | 건수 | 의미 |
|----------|------|------|
| `OCPP·호환문제` | 169건 | 앱↔기기 통신 표준 미준수 |
| `설치·인프라` | 144건 | 충전소 구축 현황 |
| `시장·정책` | 113건 | 시장 동향 |
| `제조사동향` | 94건 | Costel 등 제조사 뉴스 |
| `충전기결함` | 75건 | 기기 불량·고장 (**Negative 36%**) |

**핵심 인사이트**: 앱오류 35% 중 상당 부분이 OCPP 통신 표준 미준수·충전기 펌웨어 버그에 기인함을 규명 → PRD 하드웨어 레이어 기능 5개 추가 근거

---

### ✅ Phase 3. 다국어 전처리 — 완료

#### 실제 실행된 파이프라인

```
① 언어 감지 (langdetect)
   전체 데이터 → lang_detected 컬럼 UPDATE
   처리 속도: 500건/배치, app_reviews 28,890건 약 30분

② 감성 분석 (XLM-RoBERTa — cardiffnlp/twitter-xlm-roberta-base-sentiment)
   전체 데이터 → sentiment_label / sentiment_score 컬럼 UPDATE
   처리 속도: 64건/배치 (CPU), app_reviews 약 2시간

③ 키워드 카테고리 분류 (규칙 기반 Python)
   초기: Negative 리뷰만 → keyword_category 컬럼 UPDATE
   최종: 전체 리뷰(28,890건) → keyword_category UPDATE (neutral·positive 포함 확장)
   VOC 7개: 결제오류·연결실패·앱오류·충전속도·UI불편·충전소위치·고객서비스
   하드웨어 6개: OCPP·호환문제·연결·통신오류·충전기결함·설치·인프라·제조사동향·시장·정책

   ⚠️ keyword_category 분포에서 '기타' 비율이 높은 이유:
   - Negative만 분류할 때: 기타 50% (불만 키워드 없는 부정 리뷰)
   - 전체로 확장 후: 기타 65.5% (긍정·중립 리뷰엔 불만 키워드가 없어 당연히 기타로 분류)
   - 즉 '기타' 증가는 데이터 문제가 아니라 positive·neutral 리뷰의 특성

④ 번역 (googletrans) → 선택적 적용만
```

**언어 감지 결과 (app_reviews 28,890건)**

| 언어 | 건수 | 비율 | 설명 |
|------|------|------|------|
| vi (베트남어) | 22,476 | 77.8% | Green SM 주요 사용자층 |
| th (태국어) | 2,073 | 7.2% | PTT·PEA·EleXA 사용자 |
| en (영어) | 1,991 | 6.9% | 글로벌 리뷰 |
| 기타 (so/sk/af 등) | ~600 | ~2% | 단문 텍스트 오분류 (라오어 포함) |

**⚠️ 초기 계획과 달라진 점 — 번역 전략 전면 수정**

| 항목 | 최초 계획 | 실제 결과 | 변경 이유 |
|------|----------|---------|---------|
| 번역 범위 | 전체 데이터 영어 번역 | **선택적 번역** (필요 시만) | 아래 상세 설명 참조 |
| 분석 기준 언어 | 영어로 통일 후 분석 | **각 언어로 직접 감성 분석** | XLM-RoBERTa 100개 언어 지원, 번역 없이 정확도 더 높음 |

**번역 전략 변경 — 실제 테스트에서 발견한 속도 문제**

처음 계획은 모든 데이터를 영어로 번역한 뒤 분석하는 방식이었습니다. 그러나 실제로 실행해보니 치명적인 속도 문제가 있었습니다.

```python
# ❌ googletrans 전체 번역 시도 (실패)
from googletrans import Translator
translator = Translator()

# 1건 번역 소요 시간: 약 1~2초 (HTTP 요청 1회)
# 28,890건 기준: 28,890 × 1.5초 = 약 43,335초 ≈ 12시간

# 실제로 600건 처리 후 강제 종료 (8시간 이상 예상)
```

**해결**: XLM-RoBERTa는 번역 없이 100개 언어를 직접 처리합니다.

```python
# ✅ XLM-RoBERTa 다국어 직접 감성 분석
from transformers import pipeline

sa = pipeline("sentiment-analysis",
              model="cardiffnlp/twitter-xlm-roberta-base-sentiment")

# 번역 없이 각 언어로 직접 처리
sa("결제 오류 계속 발생")          # → negative (한국어)
sa("Ứng dụng lỗi liên tục")       # → negative (베트남어)
sa("ดี มากนะครับ ชาร์จเร็วมาก")    # → positive (태국어)
sa("ແອັບດີ ສາກໄຟງ່າຍ")            # → neutral (라오어)
# 모두 번역 없이 정확하게 분류
```

```
변경 전: 언어 감지 → 전체 번역(영어, 12시간) → 감성 분석
변경 후: 언어 감지 → 감성 분석(다국어 직접, 2시간) → 선택적 번역
```

---

**Supabase 연결 리전 오류 — Singapore Session Pooler로 전환**

처음 `.env`에 연결 정보를 입력할 때 Supabase 기본 pooler 주소를 그대로 사용했으나 접속이 실패했습니다.

```python
# ❌ 최초 연결 설정 (실패)
conn = psycopg2.connect(
    host="aws-0-ap-northeast-2.pooler.supabase.com",  # 서울 리전 pooler
    port=6543,   # Transaction Pooler
    user="postgres.nuudyfjebdgqckkhsxav",
    ...
)
# → FATAL: (ENOTFOUND) tenant/user postgres.nuudyfjebdgqckkhsxav not found

# 원인: 프로젝트를 Singapore(ap-southeast-1) 리전에서 생성했는데
#        연결 호스트에 Seoul(ap-northeast-2)을 입력해 리전 불일치 발생
```

**해결**: Supabase 대시보드 → Connect → Session Pooler 탭에서 정확한 호스트를 확인했습니다.

```python
# ✅ 올바른 연결 설정
conn = psycopg2.connect(
    host="aws-1-ap-southeast-1.pooler.supabase.com",  # Singapore 리전 ✅
    port=5432,   # Session Pooler (IPv4 지원, Direct Connection 대체)
    user="postgres.nuudyfjebdgqckkhsxav",
    password="...",
    sslmode="require",
)
# → 연결 성공
```

> Supabase Direct Connection은 기본적으로 **IPv6**만 지원합니다. 일반 가정·사무실 네트워크(IPv4)에서 접속하려면 **Session Pooler**(port 5432)를 사용해야 합니다.

---

**⚠️ 키워드 카테고리 분류 — DB 저장 방식 변경**

| 항목 | 최초 계획 | 실제 결과 | 변경 이유 |
|------|----------|---------|---------|
| 분류 후 저장 방식 | SQL UPDATE문으로 DB 직접 저장 | **Python DataFrame → 소량 배치 UPDATE** | Supabase 무료 플랜의 10초 statement timeout으로 대용량 UPDATE 불가. Python에서 분류 후 200건 배치로 나눠 UPDATE |
| Phase 4 분석 실행 위치 | SQL 쿼리 | **Python DataFrame + Matplotlib** | 아래 상세 설명 참조 |

**Phase 4 분석 — DB SQL에서 Python으로 전환**

키워드 분류와 동일한 이유(Supabase timeout)로 집계 분석 쿼리도 DB에서 직접 실행하기 어려웠습니다.

```python
# ❌ DB에서 직접 GROUP BY 집계 시도 (timeout 위험)
# SELECT keyword_category, COUNT(*) FROM app_reviews
# WHERE sentiment_label='negative' GROUP BY keyword_category
# → 28,890건 스캔 → 10초 초과 가능성

# ✅ 해결: SELECT로 데이터 로드 후 Python에서 처리
df = fetch_df("SELECT * FROM app_reviews")  # SELECT는 timeout 없음
# → Python pandas/matplotlib으로 집계·시각화
df['keyword_category'].value_counts().plot(kind='bar')
```

> SELECT(읽기)는 timeout 제한이 없지만, UPDATE/집계 연산은 제한이 있습니다.
> 데이터를 한 번에 로드한 뒤 Python에서 처리하는 방식이 더 유연합니다.

---

**배치 UPDATE(Batching)란?**

한 번에 처리하는 데이터 양을 작게 나눠 여러 번에 걸쳐 실행하는 방식입니다.

```python
# ❌ 시도한 방식 (실패)
UPDATE app_reviews
SET keyword_category = CASE WHEN ... END
WHERE sentiment_label = 'negative';
# → 15,461건 한 번에 UPDATE → 10초 초과 → Supabase 강제 종료

# ✅ 배치 UPDATE로 해결
ids = [1, 2, 3, ..., 15461]          # 전체 id 목록

for i in range(0, len(ids), 200):    # 200건씩 자름
    batch_ids = ids[i : i+200]        # [1~200], [201~400], ...

    UPDATE app_reviews
    SET keyword_category = '앱오류'
    WHERE id IN (batch_ids)           # 200건만 UPDATE → 약 1~2초, timeout 없음
```

> Supabase 무료 플랜은 단일 쿼리가 10초를 초과하면 자동으로 강제 종료합니다.
> 200건 단위로 나누면 1회 쿼리가 1~2초 안에 완료되어 timeout을 피할 수 있습니다.

---

### ✅ Phase 4. 데이터 분석 — 완료

#### 감성 분석 결과

| 테이블 | Negative | Neutral | Positive | 인사이트 |
|--------|---------|---------|---------|---------|
| **app_reviews** | **53.5%** | 25.1% | 21.4% | 앱 UX 전반 심각 |
| youtube_comments | 21.5% | 33.5% | 45.1% | 시청자는 상대적으로 긍정 |
| blog_posts | 2.4% | 45.2% | 52.4% | 여행기 특성상 긍정 위주 |
| news_articles | 4.6% | 68.5% | 26.9% | 뉴스는 중립 보도 주류 |

#### 불만 카테고리 분석 (Negative 15,461건)

| 순위 | 카테고리 | 건수 | 비율 | PRD 연계 |
|------|---------|------|------|---------|
| 1 | **앱오류** | 5,417건 | **35.0%** | 충전 세션 자동 복구 |
| 2 | **결제오류** | 1,266건 | **8.2%** | RFID 오프라인 결제 |
| 3 | 충전속도 | 317건 | 2.1% | - |
| 4 | 충전소위치 | 285건 | 1.8% | 실시간 충전소 지도 |
| 5 | UI불편 | 192건 | 1.2% | UX 개선 |
| 6 | 고객서비스 | 173건 | 1.1% | - |
| 7 | 연결실패 | 87건 | 0.6% | QR 재시도 + 수동 입력 |

#### 분석 구성 원칙 — 앱·하드웨어 분리 + 연계 분석 1개

앱과 하드웨어 분석을 **별도로 진행**하되, 두 레이어의 연결고리를 보여주는 통합 차트를 추가합니다.

| 분석 | 앱 별도 | 하드웨어 별도 | 이유 |
|------|--------|------------|------|
| 포지셔닝 맵 | 별점·리뷰수 (정량) | 뉴스 감성·카테고리 (간접) | 축이 달라 같은 차트 불가 |
| 경쟁 분석 | 5개 앱 불만 비교 | 기기 결함·OCPP 비교 | 비교 대상과 기준이 다름 |
| 워드클라우드 | 사용자 불만 언어 | 기술 이슈 전문 용어 | 혼재 시 특성 희석 |
| **연계 분석** | — | — | 앱오류 35% ↔ OCPP·기기 결함 원인 매핑 |

#### 생성된 분석 차트 (`outputs/` 폴더) — 총 9개 (포지셔닝맵·경쟁분석·워드클라우드 추가 예정)

**앱 레이어 분석 (5개 완료 + 추가 예정)**

| 파일 | 내용 | 상태 |
|------|------|------|
| `01_complaint_categories.png` | Negative 불만 카테고리 분포 | ✅ |
| `02_sentiment_by_app.png` | 앱별 긍/부/중립 비율 비교 | ✅ |
| `03_monthly_trend.png` | 월별 리뷰 트렌드 (2023~) | ✅ |
| `04_wordcloud_negative_en.png` | Negative 영어 리뷰 워드클라우드 | ✅ |
| `05_rating_distribution.png` | 전체 별점 분포 | ✅ |
| `10_app_positioning_map.png` | 앱 포지셔닝 맵 (별점 × Negative 비율) | ✅ |
| `11_app_competitive_analysis.png` | 앱별 불만 카테고리 경쟁 분석 | ✅ |
| `12_wordcloud_vi.png` | 베트남어 Negative 워드클라우드 | ✅ |
| `13_wordcloud_th.png` | 태국어 Negative 워드클라우드 | ✅ |

**하드웨어 레이어 분석 (4개 완료 + 추가 예정)**

| 파일 | 내용 | 상태 |
|------|------|------|
| `06_hw_sentiment_by_category.png` | 하드웨어 카테고리별 감성 분포 | ✅ |
| `07_hw_keyword_categories.png` | 하드웨어 키워드 카테고리 분포 | ✅ |
| `08_hw_sentiment_by_country.png` | 국가별 하드웨어 뉴스 감성 | ✅ |
| `09_hw_failure_wordcloud.png` | 충전기 결함 뉴스 워드클라우드 (영어) | ✅ |
| `14_hw_positioning_map.png` | 하드웨어 포지셔닝 맵 (건수 × Negative 비율) | ✅ |
| `15_hw_competitive_analysis.png` | 국가별 하드웨어 이슈 경쟁 분석 | ✅ |
| `16_hw_wordcloud_multilang.png` | 다국어 충전기 이슈 워드클라우드 | ✅ |

**연계 분석 (1개)**

| 파일 | 내용 | 상태 |
|------|------|------|
| `17_app_hw_linkage.png` | 앱오류 ↔ 하드웨어 원인 매핑 차트 | ✅ |

---

### ✅ Phase 5. 프로덕트 기획 연계 — PRD 완성

데이터 분석 결과를 바탕으로 PRD(`outputs/PRD_kokkok_ev.md`)를 작성했습니다.

**앱 레이어 기능 6개 + 하드웨어 레이어 기능 5개 = 총 11개**

**앱 레이어 (소프트웨어)**

| Priority | 기능 | 근거 데이터 | 기대 효과 |
|---------|------|-----------|---------|
| 🔴 P0 | **충전 세션 자동 복구** | 앱오류 35% (5,417건) | 앱오류 리뷰 50% 감소 |
| 🔴 P0 | **QR 재시도 + 수동 ID 입력** | 연결실패 + 유튜브 실사용 사례 | 연결 실패 80% 감소 |
| 🟠 P1 | **RFID 오프라인 결제** | 결제오류 8.2% (1,266건) | 결제오류 리뷰 40% 감소 |
| 🟠 P1 | **결제 확인 화면** | "결제됐는데 충전 안 됨" 불만 | 결제 불안감 해소 |
| 🟡 P2 | **실시간 충전소 지도** | 충전소위치 1.8% (285건) | 위치 불만 해소 |
| 🟡 P2 | **충전 완료 알림** | UX 전반 개선 요구 | 만족도 향상 |

**하드웨어 레이어 (충전기기)**

| Priority | 기능 | 근거 데이터 | 구현 주체 |
|---------|------|-----------|---------|
| 🔴 P0 | **OCPP 2.0.1 표준 준수 검증** | OCPP 호환 이슈 169건 | HW 제조사 협업 |
| 🔴 P0 | **충전기 상태 실시간 모니터링** | 충전기결함 Negative 36% | 백엔드·HW |
| 🟠 P1 | **앱-기기 Handshake 오류 로그 수집** | 연결실패 원인 분리 | 앱 개발 |
| 🟠 P1 | **충전기 펌웨어 원격 업데이트(OTA)** | 기기 결함 신속 대응 | HW 제조사 |
| 🟡 P2 | **충전기 고장 신고 기능 in-app** | 사용자→운영자 즉시 알림 | 앱 개발 |

**목표 KPI**: 평균 별점 2.56점 → **3.8점**, 저별점 비율 58% → **25%**

---

## 📅 전체 진행 현황

| Phase | 내용 | 상태 | 비고 |
|-------|------|------|------|
| Phase 1 | 인프라 세팅 & DB 스키마 | ✅ 완료 | Supabase 7개 테이블 |
| Phase 2 | 데이터 수집 파이프라인 | 🔄 대부분 완료 | SNS만 예정 (하드웨어 뉴스 추가 완료) |
| Phase 3 | 다국어 전처리 | ✅ 완료 | VOC + 하드웨어 뉴스 전체 적용 |
| Phase 4 | 데이터 분석 | ✅ 완료 | 차트 17개 (앱 9 + 하드웨어 7 + 연계 1) |
| Phase 5 | PRD 작성 | ✅ 완료 | 앱 6개 + 하드웨어 5개 = 총 11개 기능 |
| - | Tableau 대시보드 | ⏳ 예정 | - |
| - | Figma 프로토타입 | 🔄 진행중 | - |
| - | 발표 자료 | ⏳ 예정 | 2026-06-13~18 |
| - | 최종 발표 | 📌 확정 | 2026-06-19 |

---

## 📊 전체 수집 데이터 현황

| 테이블 | 건수 | 전처리 완료 컬럼 | 목적 | 분석 활용도 |
|--------|------|---------------|------|-----------|
| `app_reviews` | **28,890건** | 언어감지✅ 감성✅ 키워드✅ | VOC 핵심 | ⭐⭐⭐ 감성 분석, 카테고리화, PRD 근거 |
| `youtube_stt` | **2,625세그먼트** | 언어감지✅ | VOC 핵심 | ⭐⭐⭐ 실사용 맥락, 시나리오 복기 |
| `news_articles` | **2,060건** | 언어감지✅ 감성✅ 키워드✅ | Market Intel + HW | ⭐⭐ 시장·정책·하드웨어 근거 |
| `youtube_comments` | **527건** | 언어감지✅ 감성✅ 키워드✅ | VOC 보조 | ⭐⭐ 사용자 반응 |
| `blog_posts` | **42건** | 언어감지✅ 감성✅ | 참고 | ⭐ 한국인 시각 |
| `youtube_videos` | **21개** | - | 메타데이터 | ⭐ |
| `sns_posts` | 0건 | - | 참고 | 예정 |

> 📌 `news_articles` 2,060건 = VOC 뉴스 733건 + 하드웨어 뉴스 1,327건 (한·영·베·태 4개 언어)

---

## 🛠️ 기술 스택

**데이터 수집**
```
google-play-scraper           앱스토어 리뷰
YouTube Data API v3           유튜브 영상·댓글
youtube-transcript-api        유튜브 자막(STT)
Naver Search API              네이버 블로그·뉴스
Google News RSS (feedparser)  구글 뉴스
Meta Graph API                Facebook/Instagram (예정)
```

**데이터 저장**
```
PostgreSQL / Supabase Cloud   psycopg2  pandas
Session Pooler (Singapore)    port 5432
```

**전처리 & 분석**
```
langdetect                    언어 감지 (전체 데이터)
XLM-RoBERTa (HuggingFace)    다국어 감성 분석 — 번역 없이 100개 언어 직접 처리
googletrans                   선택적 번역 (필요 시만)
Matplotlib · Seaborn          분석 차트
WordCloud                     워드클라우드
```

**서비스 기획**
```
Figma (화면설계) · Figma Make (프로토타입)
Tableau (대시보드 — 예정)
```

---

## ⚠️ 계획 대비 주요 변경사항 요약

| 항목 | 최초 계획 | 변경 내용 | 이유 |
|------|----------|---------|------|
| 분석 앱 수 | 3개 | **5개** | LOCA EV 리뷰 7건 → 태국 비교군 추가 / [Phase 2 상세](#-앱스토어-리뷰-수집--총-28890건) |
| Green SM·V-Green | 별도 앱 | **동일 앱 `MUL` 처리** | `com.gsm.customer` 동일 ID 확인 / [Phase 2 상세](#-앱스토어-리뷰-수집--총-28890건) |
| Google Play 수집 | `count=500` 1회 | **언어별 5회 반복** | 언어·국가 조합당 2~3천 건 제한 / [Phase 2 상세](#-앱스토어-리뷰-수집--총-28890건) |
| Supabase 연결 | Seoul pooler | **Singapore Session Pooler** | 리전 불일치 접속 실패 / [Phase 3 상세](#-초기-계획과-달라진-점--번역-전략-전면-수정) |
| 뉴스 수집 | 없음 | **733건 추가** | VOC·Market Intel 분리 필요 / [Phase 2 상세](#-뉴스-기사-수집--733건--계획에-없던-추가-항목) |
| 유튜브 수집 | 키워드 검색만 | **하이브리드** | 검색만으로는 무관련 영상 포함 / [Phase 2 상세](#-유튜브-수집--영상-21개--댓글-527건--자막-2625세그먼트) |
| youtube-transcript-api | 클래스 메서드 | **인스턴스 메서드** | 라이브러리 버전 업 API 변경 / [Phase 2 상세](#-유튜브-수집--영상-21개--댓글-527건--자막-2625세그먼트) |
| 네이버 블로그 필터 | OR 조건 | **3중 AND 조건** | OR은 무관련 글 대량 통과 / [Phase 2 상세](#-네이버-블로그-수집--42건) |
| 번역 전략 | 전체 번역 | **선택적 번역** | googletrans 12시간 소요 / [Phase 3 상세](#✅-phase-3-다국어-전처리--완료) |
| 감성 분석 | 영어 번역 후 | **다국어 직접 처리** | XLM-RoBERTa 100개 언어 지원 / [Phase 3 상세](#✅-phase-3-다국어-전처리--완료) |
| DB UPDATE 방식 | SQL 일괄 UPDATE | **200건 배치 처리** | Supabase 10초 timeout / [Phase 3 상세](#✅-phase-3-다국어-전처리--완료) |
| Phase 4 분석 실행 | DB SQL 집계 | **Python DataFrame** | 동일 timeout 이슈 / [Phase 4 상세](#✅-phase-4-데이터-분석--완료) |
| 스키마 컬럼 | 최초 설계 누락 | **ALTER TABLE로 추가** | 실행 중 오류 발견 / [Phase 1 상세](#✅-phase-1-인프라-세팅-및-db-스키마-설계--완료) |

---

## 👥 역할 분담

| 역할 | 이름 | 담당 업무 |
|------|------|-----------|
| **Data Engineer & PM** | 마수한 | 인프라 구축, ERD/스키마 설계, 전체 데이터 파이프라인 개발, 전처리·감성분석 실행, PRD·기능 명세서 작성, Figma 화면설계 |
| **Data Analyst & PM** | 김재희 | 데이터 정제·번역 검수(라오어·베트남어), SNS 데이터 수동 보완, SQL 분석, Tableau 시각화, 유저 시나리오 분석, ERD(서비스 DB) |
