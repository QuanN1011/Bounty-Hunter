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
    row = cursor.fetchone()
    if row is None:
        conn.close()
        return {"Message": "User not found"} # prevent crash
    
    user = dict(row)
    
    conn.close()
    return user

@app.post("/tasks/{task_id}/complete")
def complete_task(task_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()

    # mark task complete
    cursor.execute("""
        UPDATE tasks
        SET complete = 1 
        WHERE task_id = ?
    """, (task_id,))

    # get reward
    cursor.execute("SELECT reward FROM tasks WHERE task_id = ?", (task_id,))
    row = cursor.fetchone()
    reward = row["reward"] if row else 0

    # update user bounty
    cursor.execute("""
        UPDATE users
        SET bounty = bounty + ?
        WHERE user_id = 1
    """, (reward,))

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

init_db()


