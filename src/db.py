"""
db.py — Supabase(PostgreSQL) 연결 모듈
psycopg2를 사용해 직접 연결, pandas DataFrame을 테이블에 적재
"""

import os
import psycopg2
import pandas as pd
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    """Supabase PostgreSQL 연결 반환"""
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT", 6543),
        dbname=os.getenv("DB_NAME", "postgres"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        sslmode="require",
    )
    return conn


def upsert_df(df: pd.DataFrame, table: str, conflict_cols: list[str]) -> int:
    """
    DataFrame을 지정 테이블에 upsert (중복 시 업데이트)

    Args:
        df: 삽입할 데이터
        table: 대상 테이블명
        conflict_cols: 중복 판단 컬럼 목록 (예: ['video_id'])

    Returns:
        삽입/업데이트된 행 수
    """
    if df.empty:
        print(f"[{table}] 빈 DataFrame, 건너뜀")
        return 0

    cols = list(df.columns)
    values = [tuple(row) for row in df.itertuples(index=False)]

    # UPDATE 대상 컬럼 (conflict 컬럼 제외)
    update_cols = [c for c in cols if c not in conflict_cols]
    update_set = ", ".join(f"{c} = EXCLUDED.{c}" for c in update_cols)

    sql = f"""
        INSERT INTO {table} ({", ".join(cols)})
        VALUES %s
        ON CONFLICT ({", ".join(conflict_cols)})
        DO UPDATE SET {update_set}
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            execute_values(cur, sql, values)
        conn.commit()

    print(f"[{table}] {len(df)}행 upsert 완료")
    return len(df)


def insert_df(df: pd.DataFrame, table: str) -> int:
    """
    DataFrame을 테이블에 단순 INSERT (중복 무시)

    Args:
        df: 삽입할 데이터
        table: 대상 테이블명

    Returns:
        삽입된 행 수
    """
    if df.empty:
        print(f"[{table}] 빈 DataFrame, 건너뜀")
        return 0

    cols = list(df.columns)
    values = [tuple(row) for row in df.itertuples(index=False)]

    sql = f"""
        INSERT INTO {table} ({", ".join(cols)})
        VALUES %s
        ON CONFLICT DO NOTHING
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            execute_values(cur, sql, values)
        conn.commit()

    print(f"[{table}] {len(df)}행 삽입 완료")
    return len(df)


def fetch_df(query: str) -> pd.DataFrame:
    """SQL 쿼리 결과를 DataFrame으로 반환"""
    with get_connection() as conn:
        return pd.read_sql(query, conn)


if __name__ == "__main__":
    # 연결 테스트
    try:
        conn = get_connection()
        print("✅ Supabase 연결 성공!")
        conn.close()
    except Exception as e:
        print(f"❌ 연결 실패: {e}")
