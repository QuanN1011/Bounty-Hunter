from fastapi import APIRouter, HTTPException
from database.connection import get_db_connection
from services.reward_service import get_level, get_progress
from services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter()


@router.get("/user")
def get_user():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE user_id = 1")
    user = cursor.fetchone()
    conn.close()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    level = get_level(user["total_bounty"])
    progress = get_progress(user["total_bounty"])

    return {
        "username": user["username"],
        "bounty": user["bounty"],
        "total_bounty": user["total_bounty"],
        "total_level": level,
        "progress": progress
    }

@router.post("/register")
def register_user(user: dict):
    username = user.get("username")
    password = user.get("password")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

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
def login_user(user: dict):
    username = user.get("username")
    password = user.get("password")

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    db_user = cursor.fetchone()
    conn.close()

    if db_user is None:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if not verify_password(password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    access_token = create_access_token({"user_id": db_user["user_id"]})

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