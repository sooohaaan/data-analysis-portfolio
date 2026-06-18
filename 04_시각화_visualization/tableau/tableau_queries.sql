-- ============================================================
-- Tableau 시각화용 커스텀 SQL 쿼리
-- Kokkok EV — 동남아 EV 충전 서비스 VOC 분석
-- ============================================================

-- ① 포지셔닝 맵 (앱별 평균별점 × Negative 비율 × 리뷰수)
-- 시트명: App Positioning Map
SELECT
    app_name,
    country,
    ROUND(AVG(rating), 2)                                                    AS avg_rating,
    COUNT(*)                                                                  AS review_count,
    ROUND(SUM(CASE WHEN sentiment_label = 'negative' THEN 1.0 ELSE 0 END)
          / COUNT(*) * 100, 1)                                               AS neg_pct,
    ROUND(SUM(CASE WHEN sentiment_label = 'positive' THEN 1.0 ELSE 0 END)
          / COUNT(*) * 100, 1)                                               AS pos_pct,
    ROUND(AVG(sentiment_score), 3)                                           AS avg_sentiment_score
FROM app_reviews
GROUP BY app_name, country
ORDER BY avg_rating DESC;


-- ② 경쟁 분석 (앱별 불만 카테고리 비율)
-- 시트명: Competitive Analysis by App
SELECT
    app_name,
    keyword_category,
    COUNT(*)                                                                  AS count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY app_name), 1) AS pct
FROM app_reviews
WHERE keyword_category IS NOT NULL
GROUP BY app_name, keyword_category
ORDER BY app_name, count DESC;


-- ③ 월별 감성 트렌드
-- 시트명: Monthly Sentiment Trend
SELECT
    TO_CHAR(review_date, 'YYYY-MM')  AS year_month,
    app_name,
    sentiment_label,
    COUNT(*)                          AS count
FROM app_reviews
WHERE review_date >= '2022-01-01'
  AND review_date IS NOT NULL
GROUP BY TO_CHAR(review_date, 'YYYY-MM'), app_name, sentiment_label
ORDER BY year_month, app_name;


-- ④ 언어별 감성 분포 (국가 대리 지표)
-- 시트명: Sentiment by Language
SELECT
    lang_detected,
    app_name,
    sentiment_label,
    COUNT(*)                                                                  AS count,
    ROUND(AVG(rating), 2)                                                    AS avg_rating
FROM app_reviews
WHERE lang_detected IN ('vi', 'th', 'en', 'ko', 'lo')
GROUP BY lang_detected, app_name, sentiment_label
ORDER BY lang_detected, count DESC;


-- ⑤ 불만 카테고리 × 감성 히트맵
-- 시트명: Category Heatmap
SELECT
    app_name,
    keyword_category,
    sentiment_label,
    COUNT(*)                                                                  AS count
FROM app_reviews
WHERE keyword_category NOT IN ('기타')
GROUP BY app_name, keyword_category, sentiment_label
ORDER BY app_name, keyword_category;


-- ⑥ 하드웨어 뉴스 vs 앱 불만 연계 분석
-- 시트명: App-HW Linkage
SELECT 'app_reviews' AS source, keyword_category, COUNT(*) AS count,
       ROUND(SUM(CASE WHEN sentiment_label='negative' THEN 1.0 ELSE 0 END)/COUNT(*)*100,1) AS neg_pct
FROM app_reviews WHERE keyword_category NOT IN ('기타')
GROUP BY keyword_category
UNION ALL
SELECT 'news_articles' AS source, keyword_category, COUNT(*) AS count,
       ROUND(SUM(CASE WHEN sentiment_label='negative' THEN 1.0 ELSE 0 END)/COUNT(*)*100,1) AS neg_pct
FROM news_articles WHERE category LIKE 'hardware%' AND keyword_category NOT IN ('기타')
GROUP BY keyword_category
ORDER BY source, neg_pct DESC;


-- ⑦ 별점 분포 (앱별)
-- 시트명: Rating Distribution
SELECT
    app_name,
    rating,
    COUNT(*)                                                                  AS count
FROM app_reviews
GROUP BY app_name, rating
ORDER BY app_name, rating;
