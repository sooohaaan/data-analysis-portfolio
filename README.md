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
    ├── PRD — 충전 세션 자동 복구, RFID 오프라인 결제 등 6개 기능
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

**Market Intelligence** (시장·정책 정보 — VOC와 목적이 달라 분리)
```sql
news_articles    (id, source, publisher, title, content, url,
                  published_date, country, category,
                  lang_detected, translated_content,
                  sentiment_label, sentiment_score)
-- source: naver_news | google_news
-- category: policy | market | infrastructure | company | other
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

| 항목 | 최초 계획 | 실제 결과 | 변경 이유 |
|------|----------|---------|---------|
| 테이블 수 | 6개 (VOC) | **7개** (VOC 6 + news_articles 1) | 뉴스 수집을 추가하면서 VOC와 Market Intelligence의 분석 목적이 다름을 인지 → 처음부터 분리 설계가 맞다고 판단 |
| blog_posts 컬럼 | translated_content만 | `lang_detected` 컬럼 추가 | 전처리 단계 실행 중 컬럼 누락 발견 → ALTER TABLE로 추가 |
| news_articles 컬럼 | sentiment_label 없음 | `sentiment_label`, `sentiment_score` 추가 | 뉴스 감성 분석을 추가하면서 컬럼 필요성 인지 |

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
| 수집 앱 수 | 3개 (LOCA EV, Green SM, V-Green) | **5개** (+ PTT·PEA·EleXA 태국 비교군) | LOCA EV 리뷰가 7건뿐이라 분석 불가 → WBS 리서치에서 확인한 태국 선도 네트워크 3개 추가. Green SM이 라오스·베트남 공용 앱으로 V-Green과 동일해 별도 수집 불필요 |
| Green SM / V-Green 구분 | 별도 앱으로 취급 | **동일 앱 ID** `MUL` 처리 | Google Play 검색 결과, Green SM(`com.gsm.customer`)이 라오스·베트남 양국에서 동일 앱 사용 확인. country 컬럼에 `MUL`(Multi) 입력, 이후 언어 감지로 국가 추정 |
| 수집 방식 | 단순 `count=500` 1회 | **언어별 5회 반복** 전수 수집 | Google Play API는 언어·국가 조합당 2,000~3,000건 상한 존재 확인. 베트남어(vi)·라오어(lo)·태국어(th)·영어(en)·한국어(ko) 5개 조합으로 26,603건 확보 |

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
| 수집 방식 | 키워드 검색만 | **하이브리드** (직접 지정 주력 + 검색 보조) | 유튜브는 앱스토어와 달리 특정 서비스 리뷰가 한 곳에 모여있지 않음. 키워드 검색만 사용하면 무관련 영상이 다수 포함됨. WBS에서 이미 검증한 영상을 직접 지정하는 방식이 정확도가 높음 |
| youtube-transcript-api 호출 방식 | `YouTubeTranscriptApi.list_transcripts()` | **인스턴스 메서드** `api = YouTubeTranscriptApi()` → `api.list()` | 라이브러리 신버전(0.6+)에서 API 구조 변경. 구버전 방식으로 실행 시 `AttributeError` 발생 → 인스턴스화 후 호출로 수정 |

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

```python
# 최종 채택 필터 — 3중 AND 조건
# 조건: title에 ① 라오스 계열 AND ② EV/충전 계열 AND ③ 후기/리뷰/경험 계열
# 예외: "LOCA EV"가 title에 있으면 ③ 면제

has_laos = any(kw in title for kw in ['라오스', 'loca ev', '비엔티안'])
has_ev   = any(kw in text  for kw in ['전기차', 'ev', '충전', ...])
has_exp  = any(kw in text  for kw in ['후기', '리뷰', '경험', '사용기', ...])
return has_laos and has_ev and has_exp
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
   Negative 리뷰만 → keyword_category 컬럼 UPDATE
   7개 카테고리: 결제오류·연결실패·앱오류·충전속도·UI불편·충전소위치·고객서비스

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
| 번역 범위 | 전체 데이터 영어 번역 | **선택적 번역** (필요 시만) | googletrans는 HTTP 요청 1건씩 처리 → 28,890건 기준 약 8~16시간 소요. 실제 테스트 중 발견. XLM-RoBERTa가 100개 언어를 번역 없이 직접 처리 가능하므로 번역 단계 생략 |
| 분석 기준 언어 | 영어로 통일 후 분석 | **각 언어로 직접 감성 분석** | 번역 시 뉘앙스 손실 위험 + 속도 문제. XLM-RoBERTa 다국어 모델이 번역보다 정확도 높음 |

```
변경 전: 언어 감지 → 전체 번역(영어) → 감성 분석
변경 후: 언어 감지 → 감성 분석(다국어 직접) → 선택적 번역
```

**⚠️ 키워드 카테고리 분류 — DB 저장 방식 변경**

| 항목 | 최초 계획 | 실제 결과 | 변경 이유 |
|------|----------|---------|---------|
| 분류 후 저장 방식 | SQL UPDATE문으로 DB 직접 저장 | **Python DataFrame → 소량 배치 UPDATE** | Supabase 무료 플랜의 10초 statement timeout으로 대용량 UPDATE 불가. Python에서 분류 후 200건 배치로 나눠 UPDATE |
| Phase 4 분석 실행 위치 | SQL 쿼리 | **Python DataFrame + Matplotlib** | 동일 이유로 DB 집계 쿼리도 timeout 위험 → SELECT로 데이터 로드 후 Python에서 분석·시각화 |

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

#### 생성된 분석 차트 (`outputs/` 폴더)

| 파일 | 내용 |
|------|------|
| `01_complaint_categories.png` | 불만 카테고리 분포 막대 차트 |
| `02_sentiment_by_app.png` | 앱별 긍/부/중립 비율 비교 |
| `03_monthly_trend.png` | 월별 리뷰 트렌드 (2023~) |
| `04_wordcloud_negative_en.png` | Negative 리뷰 워드클라우드 (영어) |
| `05_rating_distribution.png` | 전체 별점 분포 |

---

### ✅ Phase 5. 프로덕트 기획 연계 — PRD 완성

데이터 분석 결과를 바탕으로 PRD(`outputs/PRD_kokkok_ev.md`)를 작성했습니다.

**핵심 제안 기능 6개 (Pain Point 기반)**

| Priority | 기능 | 근거 데이터 | 기대 효과 |
|---------|------|-----------|---------|
| 🔴 P0 | **충전 세션 자동 복구** | 앱오류 35% (5,417건) | 앱오류 리뷰 50% 감소 |
| 🔴 P0 | **QR 재시도 + 수동 ID 입력** | 연결실패 + 유튜브 실사용 사례 | 연결 실패 80% 감소 |
| 🟠 P1 | **RFID 오프라인 결제** | 결제오류 8.2% (1,266건) | 결제오류 리뷰 40% 감소 |
| 🟠 P1 | **결제 확인 화면** | "결제됐는데 충전 안 됨" 불만 | 결제 불안감 해소 |
| 🟡 P2 | **실시간 충전소 지도** | 충전소위치 1.8% (285건) | 위치 불만 해소 |
| 🟡 P2 | **충전 완료 알림** | UX 전반 개선 요구 | 만족도 향상 |

**목표 KPI**: 평균 별점 2.56점 → **3.8점**, 저별점 비율 58% → **25%**

---

## 📅 전체 진행 현황

| Phase | 내용 | 상태 | 비고 |
|-------|------|------|------|
| Phase 1 | 인프라 세팅 & DB 스키마 | ✅ 완료 | Supabase 7개 테이블 |
| Phase 2 | 데이터 수집 파이프라인 | 🔄 대부분 완료 | SNS만 예정 |
| Phase 3 | 다국어 전처리 | ✅ 완료 | 번역 전략 변경됨 |
| Phase 4 | 데이터 분석 | ✅ 완료 | 차트 5개 생성 |
| Phase 5 | PRD 작성 | ✅ 완료 | 기능 6개 제안 |
| - | Tableau 대시보드 | ⏳ 예정 | - |
| - | Figma 프로토타입 | 🔄 진행중 | - |
| - | 발표 자료 | ⏳ 예정 | 2026-06-13~18 |
| - | 최종 발표 | 📌 확정 | 2026-06-19 |

---

## 📊 전체 수집 데이터 현황

| 테이블 | 건수 | 목적 | 분석 활용도 |
|--------|------|------|-----------|
| `app_reviews` | **28,890건** | VOC 핵심 | ⭐⭐⭐ 감성 분석, 카테고리화, PRD 근거 |
| `youtube_stt` | **2,625세그먼트** | VOC 핵심 | ⭐⭐⭐ 실사용 맥락, 시나리오 복기 |
| `news_articles` | **733건** | Market Intel | ⭐⭐ 시장·정책 근거 |
| `youtube_comments` | **527건** | VOC 보조 | ⭐⭐ 사용자 반응 |
| `youtube_videos` | **21개** | 메타데이터 | ⭐ |
| `blog_posts` | **42건** | 참고 | ⭐ 한국인 시각 |
| `sns_posts` | 0건 | 참고 | 예정 |

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
| 분석 앱 수 | 3개 | **5개** | LOCA EV 리뷰 부재 → 태국 비교군 추가 |
| 뉴스 수집 | 없음 | **733건 추가** | VOC와 Market Intelligence 분리 필요성 인식 |
| 번역 범위 | 전체 번역 | **선택적 번역** | googletrans 28,890건 8~16시간 소요 |
| 감성 분석 언어 | 영어 번역 후 분석 | **다국어 직접 분석** | XLM-RoBERTa 100개 언어 지원 |
| DB 분류 저장 | SQL UPDATE 일괄 | **Python 배치 처리** | Supabase 무료 플랜 10초 timeout |
| Phase 4 실행 | DB SQL 집계 | **Python DataFrame** | 동일 timeout 이슈 |
| 유튜브 수집 | 키워드 검색만 | **하이브리드** | 검색만으로는 무관련 영상 다수 포함 |
| 네이버 블로그 필터 | 단순 키워드 OR | **3중 AND 조건** | OR 조건은 무관련 글 대량 통과 |

---

## 👥 역할 분담

| 역할 | 이름 | 담당 업무 |
|------|------|-----------|
| **Data Engineer & PM** | 마수한 | 인프라 구축, ERD/스키마 설계, 전체 데이터 파이프라인 개발, 전처리·감성분석 실행, PRD·기능 명세서 작성, Figma 화면설계 |
| **Data Analyst & PM** | 김재희 | 데이터 정제·번역 검수(라오어·베트남어), SNS 데이터 수동 보완, SQL 분석, Tableau 시각화, 유저 시나리오 분석, ERD(서비스 DB) |
