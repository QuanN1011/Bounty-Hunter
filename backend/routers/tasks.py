from fastapi import APIRouter, HTTPException
from database.connection import get_db_connection
from services.reward_service import calculate_rewards
from fastapi import Depends
from services.auth_service import get_current_user
from datetime import date, timedelta

router = APIRouter()


@router.post("/tasks")
def create_task(task: dict, user_id: int = Depends(get_current_user)):
    required_fields = ["name", "description", "difficulty", "reward"]

    for field in required_fields:
        if field not in task:
            raise HTTPException(status_code=400, detail=f"Missing field: {field}")

    if task["difficulty"] not in ["Easy", "Medium", "Hard"]:
        raise HTTPException(status_code=400, detail="Invalid difficulty")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO tasks (name, description, difficulty, reward, complete, user_id)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        task["name"],
        task["description"],
        task["difficulty"],
        task["reward"],
        False,
        user_id
    ))

    conn.commit()
    conn.close()

    return {"message": "Task created"}


@router.get("/tasks")
def get_tasks(user_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
    "SELECT * FROM tasks WHERE user_id = ?",
    (user_id,)
    )

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


@router.get("/tasks/{task_id}")
def get_task_by_id(task_id: int, user_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM tasks WHERE task_id = ? AND user_id = ?", 
                   (task_id, user_id)
    )
    row = cursor.fetchone()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return dict(row)


@router.put("/tasks/{task_id}")
def update_task(task_id: int, updated_task: dict, user_id: int = Depends(get_current_user)):
    required_fields = ["name", "description", "difficulty", "reward"]

    for field in required_fields:
        if field not in updated_task:
            raise HTTPException(status_code=400, detail=f"Missing field: {field}")

    if updated_task["difficulty"] not in ["Easy", "Medium", "Hard"]:
        raise HTTPException(status_code=400, detail="Invalid difficulty")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM tasks WHERE task_id = ? AND user_id = ?", 
                   (task_id, user_id)
    )

    existing_task = cursor.fetchone()

    if existing_task is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")

    cursor.execute("""
        UPDATE tasks
        SET name = ?, description = ?, difficulty = ?, reward = ?
        WHERE task_id = ? AND user_id = ?
    """, (
        updated_task["name"],
        updated_task["description"],
        updated_task["difficulty"],
        updated_task["reward"],
        task_id,
        user_id
    ))

    conn.commit()

    cursor.execute("SELECT * FROM tasks WHERE task_id = ?", (task_id,))
    task = dict(cursor.fetchone())
    conn.close()

    return {
        "message": "Task updated successfully",
        "task": task
    }


@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, user_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM tasks WHERE task_id = ? AND user_id = ?", 
                   (task_id, user_id)
    )
    task = cursor.fetchone()

    if task is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")

    cursor.execute("DELETE FROM tasks WHERE task_id = ? AND user_id = ?", 
                   (task_id, user_id)
    )
    conn.commit()
    conn.close()

    return {"message": "Task deleted"}


@router.post("/tasks/{task_id}/complete")
def complete_task(task_id: int, user_id: int = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT t.reward, t.difficulty, t.complete,
            u.streak_count, u.last_completed_date
        FROM tasks t
        JOIN users u ON u.user_id = t.user_id
        WHERE t.task_id = ? AND t.user_id = ?
        """,
        (task_id, user_id)
    )
    row = cursor.fetchone()

    if row is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")

    if row["complete"]:
        conn.close()
        raise HTTPException(status_code=400, detail="Task already completed")

    base_reward = row["reward"]
    difficulty = row["difficulty"]
    reward = calculate_rewards(base_reward, difficulty)

    cursor.execute("""
        UPDATE tasks
        SET complete = 1
        WHERE task_id = ?
    """, (task_id,))

    today = date.today()
    today_str = today.isoformat()
    yesterday_str = (today - timedelta(days=1)).isoformat()

    current_streak = row["streak_count"] or 0
    last_completed_date = row["last_completed_date"]

    if last_completed_date == today_str:
        new_streak = current_streak
    elif last_completed_date == yesterday_str:
        new_streak = current_streak + 1
    else:
        new_streak = 1


    cursor.execute("""
        UPDATE users
        SET bounty = bounty + ?,
            total_bounty = total_bounty + ?,
            streak_count = ?,
            last_completed_date = ?
        WHERE user_id = ?
    """, (reward, reward, new_streak, today_str, user_id))

    conn.commit()
    conn.close()

    return {
        "message": "Task completed",
        "reward_earned": reward
    }