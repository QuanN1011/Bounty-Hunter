from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

task = {
    "task_id": 1,
    "name": "Example Task",
    "description": "This is an example task.",
    "difficulty": "Medium",
    "reward": 100,
    "complete": False,
}

user = {
    "user_id": 1,
    "username": "example_user",
    "bounty": 0
}

tasks = [task]


@app.get("/")
def read_root():
    return {"message": "Welcome to the Task Management API!"}

@app.post("/tasks")
def create_task(task: dict):
    tasks.append(task)
    return {"message": "Task created successfully", "task": task}

@app.get("/tasks")
def get_tasks():
    return {"tasks": tasks}

@app.get("/tasks/{task_id}")
def get_task_by_id(task_id: int):
    for task in tasks:
        if task["task_id"] == task_id:
            return task
    return {"message": "Task not found"}

@app.get("/user")
def get_user():
    return user

@app.post("/tasks/{task_id}/complete")
def complete_task(task_id: int):
    for task in tasks:
        if task["task_id"] == task_id:
            if not task["complete"]:
                task["complete"] = True
                user["bounty"] += task["reward"]
                return {"message": "Task completed successfully", "task": task}
            else:
                return {"message": "Task is already completed"}
