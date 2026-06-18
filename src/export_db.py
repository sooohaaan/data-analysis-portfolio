"""Supabase(PostgreSQL) 테이블을 CSV로 export.

사용법:
    python src/export_db.py            # 전체 public 테이블 → 02_수집_collection/exports/<table>.csv

- 접속 정보는 .env(DB_HOST/PORT/NAME/USER/PASSWORD)에서 읽음 (커밋 금지)
- COPY ... TO STDOUT 으로 스트리밍 export (메모리 안전)
- 45MB 초과 파일은 gzip(.csv.gz) 압축
"""
import os
import gzip
import shutil
from pathlib import Path

from dotenv import load_dotenv

from db import get_connection

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "02_수집_collection" / "exports"
GZIP_THRESHOLD = 45 * 1024 * 1024  # 45MB


def export_all():
    load_dotenv(ROOT / ".env")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "select table_name from information_schema.tables "
                "where table_schema='public' order by table_name"
            )
            tables = [r[0] for r in cur.fetchall()]

        for t in tables:
            csv_path = OUT_DIR / f"{t}.csv"
            with conn.cursor() as cur, open(csv_path, "w", encoding="utf-8", newline="") as f:
                cur.copy_expert(f'COPY (SELECT * FROM "{t}") TO STDOUT WITH CSV HEADER', f)
            size = csv_path.stat().st_size
            final = csv_path
            if size > GZIP_THRESHOLD:
                gz_path = csv_path.with_suffix(".csv.gz")
                with open(csv_path, "rb") as fin, gzip.open(gz_path, "wb") as fout:
                    shutil.copyfileobj(fin, fout)
                csv_path.unlink()
                final = gz_path
                size = gz_path.stat().st_size
            results.append((t, final.name, size))
            print(f"  {t:24s} -> {final.name:28s} {size/1024:>10,.1f} KB")
    return results


if __name__ == "__main__":
    print(f"export → {OUT_DIR}")
    export_all()
    print("완료")
