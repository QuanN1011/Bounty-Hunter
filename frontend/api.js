const source = "http://127.0.0.1:8000";

// get user
export async function getUser() {
    try {
        const response = await fetch(`${source}/user`);
        if (!response.ok) {
            throw new Error("Failed to fetch user");
        }
        return await response.json();
    } catch (error) {
        console.error("Error loading user:", error);
        return null;
    }
}

// get tasks
export async function getTasks() {
    try {
        const response = await fetch(`${source}/tasks`);
        if (!response.ok) {
            throw new Error("Failed to fetch tasks");
        }
        return await response.json();
    } catch (error) {
        console.error("Error loading tasks:", error);
        return [];
    }
}

// create task
export async function createTask(task) {
    try {
        const response = await fetch(`${source}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            throw new Error("Failed to create task");
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating task:", error);
    }
}

// complete task
export async function completeTaskAPI(taskId) {
    try {
        const response = await fetch(`${source}/tasks/${taskId}/complete`, {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error("Failed to complete task");
        }

        return await response.json();
    } catch (error) {
        console.error("Error completing task:", error);
    }
}

// delete task
export async function deleteTaskAPI(taskId) {
    try {
        const response = await fetch(`${source}/tasks/${taskId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete task");
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}

// update task
export async function updateTaskAPI(taskId, updatedTask) {
    try {
        const response = await fetch(`${source}/tasks/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedTask)
        });

        if (!response.ok) {
            throw new Error("Failed to update task");
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating task:", error);
    }
}