import sqlite3
from pathlib import Path

_BACKEND_DIR = Path(__file__).resolve().parent.parent
DB_PATH = _BACKEND_DIR / "bounty_hunter.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            bounty INTEGER DEFAULT 0,
            total_bounty INTEGER DEFAULT 0,
            streak_count INTEGER DEFAULT 0,
            last_completed_date TEXT
        )
    """)

    # migration to add steak count and last completed date if don't exist
    cursor.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in cursor.fetchall()]

    if "streak_count" not in columns:
        cursor.execute("ALTER TABLE users ADD COLUMN streak_count INTEGER DEFAULT 0")

    if "last_completed_date" not in columns:
        cursor.execute("ALTER TABLE users ADD COLUMN last_completed_date TEXT")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            task_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            difficulty TEXT,
            reward INTEGER,
            category TEXT DEFAULT "General",
            complete BOOLEAN DEFAULT 0,
            user_id INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)

    # migration to add category if doesn't exist
    cursor.execute("PRAGMA table_info(tasks)")
    task_columns = [row[1] for row in cursor.fetchall()]

    if "category" not in task_columns:
        cursor.execute("ALTER TABLE tasks ADD COLUMN category TEXT DEFAULT 'General'")



    conn.commit()
    conn.close()