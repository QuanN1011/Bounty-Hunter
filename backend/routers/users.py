from fastapi import APIRouter, HTTPException
from database.connection import get_db_connection
from services.reward_service import get_level, get_progress

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