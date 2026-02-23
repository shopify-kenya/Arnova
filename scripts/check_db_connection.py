#!/usr/bin/env python3
"""
Quick database connectivity check.
Respects POSTGRES_URL from environment.
"""
import os

import dj_database_url


def main() -> int:
    db_url = os.getenv("POSTGRES_URL")
    if not db_url:
        print("No POSTGRES_URL set; using SQLite fallback.")
        return 0

    config = dj_database_url.parse(db_url, conn_max_age=0)
    engine = config.get("ENGINE", "")
    name = config.get("NAME", "")
    print(f"Engine: {engine}")
    print(f"Database: {name}")

    try:
        if "sqlite" in engine:
            import sqlite3

            conn = sqlite3.connect(name)
            conn.execute("SELECT 1")
            conn.close()
        else:
            import psycopg2

            conn = psycopg2.connect(
                dbname=config.get("NAME"),
                user=config.get("USER"),
                password=config.get("PASSWORD"),
                host=config.get("HOST"),
                port=config.get("PORT") or 5432,
                sslmode=(config.get("OPTIONS") or {}).get("sslmode", None),
            )
            cur = conn.cursor()
            cur.execute("SELECT 1")
            cur.fetchone()
            conn.close()
        print("✅ Database connection OK")
        return 0
    except Exception as exc:
        print(f"❌ Database connection failed: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
