from fastapi import APIRouter, HTTPException
from database.connection import get_db_connection
from services.reward_service import get_level, get_progress
from services.auth_service import hash_password, verify_password, create_access_token
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends
from services.auth_service import get_current_user
from datetime import date, timedelta

router = APIRouter()


@router.get("/user/me")
def get_current_user_info(user_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    user = cursor.fetchone()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    level = get_level(user["total_bounty"])
    progress = get_progress(user["total_bounty"])
    streak_count = user["streak_count"] or 0
    last_completed_date = user["last_completed_date"]

    if last_completed_date:
        yesterday_str = (date.today() - timedelta(days=1)).isoformat()

        # if last completed date is before yesterday, streak is reset
        if last_completed_date < yesterday_str:
            streak_count = 0
            cursor.execute("UPDATE users SET streak_count = ? WHERE user_id = ?", (streak_count, user_id))
            conn.commit()
    
    # to track total completed tasks, use count
    cursor.execute(
        """
        SELECT COUNT(*) AS n
        FROM tasks
        WHERE user_id = ? AND complete = 1
        """,
        (user_id,),
    )
    tasks_completed = cursor.fetchone()["n"]
    
    conn.close()

    return {
        "user_id": user["user_id"],
        "username": user["username"],
        "bounty": user["bounty"],
        "total_bounty": user["total_bounty"],
        "level": level,
        "progress": progress,
        "streak_count": streak_count,
        "last_completed_date": last_completed_date,
        "tasks_completed": tasks_completed
    }

@router.post("/register")
def register_user(user: dict):
    username = (user.get("username") or "").strip()
    password = user.get("password")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    if " " in username:
        raise HTTPException(status_code=400, detail="Username cannot contain spaces")

    hashed_password = hash_password(password)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO users (username, password_hash, bounty, total_bounty)
            VALUES (?, ?, 0, 0)
        """, (username, hashed_password))
        conn.commit()

    except Exception:
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")

    conn.close()

    return {"message": "User registered successfully"}

@router.post("/login")
def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    username = (form_data.username or " ").strip()
    password = form_data.password

    if " " in username:
        raise HTTPException(status_code=400, detail="Invalid username or password")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    db_user = cursor.fetchone()
    conn.close()

    if db_user is None:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not verify_password(password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    access_token = create_access_token({"sub": str(db_user["user_id"])})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/user/{user_id}")
def get_user_by_id(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    level = get_level(user["total_bounty"])
    progress = get_progress(user["total_bounty"])

    return {
        "user_id": user["user_id"],
        "username": user["username"],
        "bounty": user["bounty"],
        "total_bounty": user["total_bounty"],
        "total_level": level,
        "progress": progress
    }


