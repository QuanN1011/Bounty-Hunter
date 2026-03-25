import sqlite3

def get_db_connection():
    conn = sqlite3.connect("bounty_hunter.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            bounty INTEGER DEFAULT 0,
            total_bounty INTEGER DEFAULT 0
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            task_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            difficulty TEXT,
            reward INTEGER,
            complete BOOLEAN DEFAULT 0
        )
    """)

    # create default user if not exists
    cursor.execute("SELECT * FROM users WHERE user_id = 1")
    user = cursor.fetchone()

    if user is None:
        cursor.execute("""
            INSERT INTO users (user_id, username, bounty, total_bounty)
            VALUES (1, 'Quan', 0, 0)
        """)

    conn.commit()
    conn.close()