from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, get_db_connection

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Task Management API!"}

@app.post("/tasks")
def create_task(task: dict):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO tasks (name, description, difficulty, reward, complete) VALUES (?, ?, ?, ?, ?)
    """,(
        task["name"],
        task["description"],
        task["difficulty"],
        task["reward"],
        False
    ))

    conn.commit()
    conn.close()

    return {"Message": "Task created"}

@app.get("/tasks")
def get_tasks():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM tasks') # get all rows
    rows = cursor.fetchall()

    # convert rows to dictionary format
    tasks = [dict(row) for row in rows]
    conn.close()
    
    return tasks

@app.get("/tasks/{task_id}")
def get_task_by_id(task_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    # get task with id
    cursor.execute("SELECT * FROM tasks WHERE task_id = ?", (task_id,))
    row = cursor.fetchone()

    conn.close()

    # if no task found
    if row is None:
        return {"Message": "Task not found"}
    
    # convert row to dict
    return dict(row)

@app.get("/user")
def get_user():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE user_id = 1")
    user = cursor.fetchone()
    if user is None:
        conn.close()
        return {"Message": "User not found"} # prevent crash
    
    level = get_level(user["total_bounty"])
    progress = get_progress(user["total_bounty"])
    conn.close()
    
    return {
        "username": user["username"],
        "bounty": user["bounty"],
        "total_bounty": user["total_bounty"],
        "total_level": level,
        "progress": progress
    }

@app.post("/tasks/{task_id}/complete")
def complete_task(task_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    # get reward
    cursor.execute("SELECT reward, difficulty, complete FROM tasks WHERE task_id = ?", (task_id,))
    row = cursor.fetchone()

    if row is None:
        conn.close()
        return {"Message": "Task not found"}

    if row["complete"]:
        conn.close()
        return {"Message": "Task already completed"}

    base_reward = row["reward"]
    difficulty = row["difficulty"]

    reward = calculate_rewards(base_reward, difficulty)

    # mark task complete
    cursor.execute("""
        UPDATE tasks
        SET complete = 1 
        WHERE task_id = ?
    """, (task_id,))

    # update user bounty and total bounty
    cursor.execute("""
        UPDATE users
        SET bounty = bounty + ?,
            total_bounty = total_bounty + ?
        WHERE user_id = 1
    """, (reward, reward))

    conn.commit()
    conn.close()

    return {"Message": "Task completed"}

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM tasks WHERE task_id = ?", (task_id,))

    conn.commit()
    conn.close()

    return {"Message": "Task deleted"}

@app.put("/tasks/{task_id}")
def update_task(task_id: int, update_task: dict):
    conn = get_db_connection()
    cursor = conn.cursor()

    # check if task exists
    cursor.execute("SELECT * FROM tasks WHERE task_id = ?", (task_id,))
    if cursor.fetchone() is None:
        conn.close()
        return {"Message": "Task not found"}
    
    # update fields
    cursor.execute("""
        UPDATE tasks
        SET name = ?, description = ?, difficulty = ?, reward = ?
        WHERE task_id = ?
    """, (
        update_task["name"],
        update_task["description"],
        update_task["difficulty"],
        update_task["reward"],
        task_id
    ))

    conn.commit()

    #get update task
    cursor.execute("SELECT * FROM tasks WHERE task_id = ?", (task_id,))
    updated_task = dict(cursor.fetchone())

    conn.close()

    return {
        "message": "Task updated successfully",
        "task": updated_task
    }

# get level
def get_level(total_bounty):
    if total_bounty >= 10000:
        return "Emperor"

    elif total_bounty >= 4000:
        return "Warlord"

    elif total_bounty >= 1500:
        return "Worst Generation"

    elif total_bounty >= 500:
        return "Pirate"

    else:
        return "Rookie"
    
# get progress for progress bar
def get_progress(total_bounty):

    levels = [0, 500, 1500, 4000, 10000]

    for i in range(len(levels) - 1):

        if total_bounty < levels[i+1]:

            current = levels[i]
            next_level = levels[i+1]

            progress = (total_bounty - current) / (next_level - current)

            return int(progress * 100)

    return 100

# function to reward harder tasks

def calculate_rewards(base_reward, difficulty):
    if difficulty == "Hard":
        return int(base_reward * 2)
    elif difficulty == "Medium":
        return int(base_reward * 1.5)
    else:
        return base_reward
    


init_db()


