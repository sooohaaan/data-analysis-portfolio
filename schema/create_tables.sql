-- ============================================================
-- Kokkok EV — VOC DB Schema DDL
-- Supabase SQL Editor에서 순서대로 실행
-- ============================================================

-- ─────────────────────────────────────
-- 1. 앱스토어 리뷰
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_reviews (
    id                 BIGSERIAL PRIMARY KEY,
    store              VARCHAR(20)  NOT NULL CHECK (store IN ('google_play', 'app_store')),
    app_name           VARCHAR(100) NOT NULL,
    country            CHAR(3)      NOT NULL, -- ISO 3166-1 alpha-3: LAO, VNM, KOR
    rating             SMALLINT     CHECK (rating BETWEEN 1 AND 5),
    author             VARCHAR(200),
    review_date        DATE,
    content            TEXT         NOT NULL,
    lang_detected      VARCHAR(10),           -- lo, vi, th, en, ko 등
    translated_content TEXT,                  -- Google Translate → 영어
    sentiment_label    VARCHAR(10)  CHECK (sentiment_label IN ('positive', 'negative', 'neutral')),
    sentiment_score    FLOAT        CHECK (sentiment_score BETWEEN 0 AND 1),
    keyword_category   VARCHAR(50),           -- 결제오류 | 연결실패 | UI불편 | 충전속도 | 앱오류 | 기타
    created_at         TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_reviews_app_country  ON app_reviews (app_name, country);
CREATE INDEX IF NOT EXISTS idx_app_reviews_rating        ON app_reviews (rating);
CREATE INDEX IF NOT EXISTS idx_app_reviews_sentiment     ON app_reviews (sentiment_label);
CREATE INDEX IF NOT EXISTS idx_app_reviews_review_date   ON app_reviews (review_date);

COMMENT ON TABLE app_reviews IS 'Google Play / App Store 리뷰. 라오스·베트남 EV 충전 앱 대상.';

-- ─────────────────────────────────────
-- 2. 유튜브 영상 (부모 테이블)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS youtube_videos (
    video_id     VARCHAR(20)  PRIMARY KEY, -- YouTube video ID (11자리)
    title        TEXT         NOT NULL,
    channel_name VARCHAR(200),
    country      CHAR(3),                  -- LAO, VNM, KOR, THA
    upload_date  DATE,
    view_count   BIGINT,
    like_count   BIGINT,
    description  TEXT,
    created_at   TIMESTAMPTZ  DEFAULT NOW()
);

COMMENT ON TABLE youtube_videos IS 'YouTube Data API v3로 수집한 영상 메타데이터.';

-- ─────────────────────────────────────
-- 3. 유튜브 댓글
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS youtube_comments (
    id                 BIGSERIAL PRIMARY KEY,
    video_id           VARCHAR(20)  NOT NULL REFERENCES youtube_videos(video_id) ON DELETE CASCADE,
    author             VARCHAR(200),
    content            TEXT         NOT NULL,
    like_count         INT          DEFAULT 0,
    comment_date       TIMESTAMPTZ,
    lang_detected      VARCHAR(10),
    translated_content TEXT,
    sentiment_label    VARCHAR(10)  CHECK (sentiment_label IN ('positive', 'negative', 'neutral')),
    sentiment_score    FLOAT        CHECK (sentiment_score BETWEEN 0 AND 1),
    keyword_category   VARCHAR(50),
    created_at         TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_youtube_comments_video_id  ON youtube_comments (video_id);
CREATE INDEX IF NOT EXISTS idx_youtube_comments_sentiment ON youtube_comments (sentiment_label);

COMMENT ON TABLE youtube_comments IS 'YouTube Data API v3 댓글 수집.';

-- ─────────────────────────────────────
-- 4. 유튜브 자막 (STT)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS youtube_stt (
    id                 BIGSERIAL PRIMARY KEY,
    video_id           VARCHAR(20)  NOT NULL REFERENCES youtube_videos(video_id) ON DELETE CASCADE,
    timestamp_start    FLOAT        NOT NULL, -- 자막 시작 시간 (초)
    timestamp_end      FLOAT,                 -- 자막 종료 시간 (초)
    content            TEXT         NOT NULL,
    translated_content TEXT,
    created_at         TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_youtube_stt_video_id ON youtube_stt (video_id);

COMMENT ON TABLE youtube_stt IS 'youtube-transcript-api로 수집한 자막. 라오어 자동 캡션 품질 주의.';

-- ─────────────────────────────────────
-- 5. SNS 게시물 (Facebook / Instagram)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS sns_posts (
    id                  BIGSERIAL PRIMARY KEY,
    platform            VARCHAR(20)  NOT NULL CHECK (platform IN ('facebook', 'instagram')),
    page_name           VARCHAR(200),
    country             CHAR(3),
    content             TEXT         NOT NULL,
    post_date           DATE,
    lang_detected       VARCHAR(10),
    translated_content  TEXT,
    sentiment_label     VARCHAR(10)  CHECK (sentiment_label IN ('positive', 'negative', 'neutral')),
    sentiment_score     FLOAT        CHECK (sentiment_score BETWEEN 0 AND 1),
    keyword_category    VARCHAR(50),
    collection_method   VARCHAR(30), -- graph_api | manual | selenium
    created_at          TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sns_posts_platform  ON sns_posts (platform);
CREATE INDEX IF NOT EXISTS idx_sns_posts_country   ON sns_posts (country);
CREATE INDEX IF NOT EXISTS idx_sns_posts_sentiment ON sns_posts (sentiment_label);

COMMENT ON TABLE sns_posts IS 'Meta Graph API 우선 수집. 수집 불가 시 수동 캡처. Meta ToS 준수 필요.';

-- ─────────────────────────────────────
-- 6. 블로그 포스트 (네이버 블로그)
-- ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
    id                 BIGSERIAL PRIMARY KEY,
    platform           VARCHAR(30)  NOT NULL DEFAULT 'naver_blog',
    title              TEXT,
    content            TEXT         NOT NULL,
    author             VARCHAR(200),
    post_date          DATE,
    url                TEXT,
    translated_content TEXT,
    sentiment_label    VARCHAR(10)  CHECK (sentiment_label IN ('positive', 'negative', 'neutral')),
    sentiment_score    FLOAT        CHECK (sentiment_score BETWEEN 0 AND 1),
    keyword_category   VARCHAR(50),
    created_at         TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_post_date ON blog_posts (post_date);

COMMENT ON TABLE blog_posts IS '한국인 라오스 여행객 EV 충전 경험 리뷰. BeautifulSoup 수집.';
