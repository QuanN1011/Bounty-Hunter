import sqlite3

def get_db_connection():
    conn = sqlite3.connect(
        'bounty_hunter.db',
        timeout = 10,
        check_same_thread = False
    )
    
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            bounty INTEGER DEFAULT 0,
            total_bounty INTEGER DEFAULT 0
        )
    ''')

    # create tasks table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            task_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            difficulty TEXT,
            reward INTEGER,
            complete BOOLEAN DEFAULT 0
        )
    ''')

    # check if user exists, if not create default user
    cursor.execute('SELECT * FROM users WHERE username = ?', ('example_user',))
    if cursor.fetchone() is None:
        cursor.execute('INSERT INTO users (username, bounty) VALUES (?, ?)', ('example_user', 0))
    
    conn.commit()
    conn.close()