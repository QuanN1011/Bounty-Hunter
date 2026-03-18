from fastapi import FastAPI

app = FastAPI()

task = {
    "name": "Example Task",
    "description": "This is an example task.",
    "difficulty": "Medium",
    "reward": 100,
    "status": "Not Started"
}

tasks = [task]


@app.get("/")
def read_root():
    return tasks

@app.post("/tasks")
def create_task(task: dict):
    tasks.append(task)
    return {"message": "Task created successfully", "task": task}
