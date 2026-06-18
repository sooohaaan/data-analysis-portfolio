# 🗄️ DB exports — Supabase 테이블 CSV 스냅샷

Supabase Cloud(`laos-ev-voc-db`)의 PostgreSQL 테이블을 CSV로 export한 스냅샷입니다.
생성 스크립트: [`../../src/export_db.py`](../../src/export_db.py) · 스키마: [`../../schema/create_tables.sql`](../../schema/create_tables.sql)

> ⚠️ 분석 시점의 정적 스냅샷입니다. 최신 데이터는 `python src/export_db.py`로 재생성하세요.

## 테이블

| 파일 | 행 수 | 컬럼 수 | 크기 |
|------|------:|--------:|-----:|
| `app_reviews.csv` | 28,890 | 15 | 7,023 KB |
| `blog_posts.csv` | 42 | 13 | 32 KB |
| `news_articles.csv` | 3,085 | 15 | 1,887 KB |
| `reference_stats.csv` | 54 | 13 | 8 KB |
| `sns_posts.csv` | 0 | 13 | 0 KB |
| `superapp_reviews.csv` | 3,370 | 14 | 850 KB |
| `youtube_comments.csv` | 527 | 12 | 204 KB |
| `youtube_stt.csv` | 2,625 | 8 | 368 KB |
| `youtube_videos.csv` | 21 | 9 | 13 KB |

## 컬럼 (참고)

- **app_reviews.csv** — `id`, `store`, `app_name`, `country`, `rating`, `author`, `review_date`, `content`, `lang_detected`, `translated_content`, `sentiment_label`, `sentiment_score`, `keyword_category`, `created_at`, `keyword_domain`
- **blog_posts.csv** — `id`, `platform`, `title`, `content`, `author`, `post_date`, `url`, `translated_content`, `sentiment_label`, `sentiment_score`, `keyword_category`, `created_at`, `lang_detected`
- **news_articles.csv** — `id`, `source`, `publisher`, `title`, `content`, `url`, `published_date`, `country`, `category`, `lang_detected`, `translated_content`, `created_at`, `sentiment_label`, `sentiment_score`, `keyword_category`
- **reference_stats.csv** — `id`, `category`, `entity`, `metric`, `value_num`, `value_text`, `unit`, `country`, `period`, `source`, `reliability`, `note`, `created_at`
- **sns_posts.csv** — `id`, `platform`, `page_name`, `country`, `content`, `post_date`, `lang_detected`, `translated_content`, `sentiment_label`, `sentiment_score`, `keyword_category`, `collection_method`, `created_at`
- **superapp_reviews.csv** — `id`, `store`, `app_name`, `app_category`, `country`, `rating`, `author`, `review_date`, `content`, `lang_detected`, `sentiment_label`, `sentiment_score`, `keyword_category`, `created_at`
- **youtube_comments.csv** — `id`, `video_id`, `author`, `content`, `like_count`, `comment_date`, `lang_detected`, `translated_content`, `sentiment_label`, `sentiment_score`, `keyword_category`, `created_at`
- **youtube_stt.csv** — `id`, `video_id`, `timestamp_start`, `timestamp_end`, `content`, `translated_content`, `created_at`, `lang_detected`
- **youtube_videos.csv** — `video_id`, `title`, `channel_name`, `country`, `upload_date`, `view_count`, `like_count`, `description`, `created_at`

## 복원 방법

스키마 생성 후 CSV 적재(psql 사용 시):

```bash
psql "$DATABASE_URL" -f schema/create_tables.sql
# 테이블별:
psql "$DATABASE_URL" -c "\copy app_reviews from '02_수집_collection/exports/app_reviews.csv' csv header"
```

psql이 없으면 Python으로 적재(프로젝트 `src/db.py` 활용):

```python
import pandas as pd; from src.db import insert_df
insert_df(pd.read_csv('02_수집_collection/exports/app_reviews.csv'), 'app_reviews')
```
