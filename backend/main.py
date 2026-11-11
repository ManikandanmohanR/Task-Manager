from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import get_connection

app = FastAPI()

# Allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class Task(BaseModel):
    title: str
    description: str = ""
    completed: bool = False


# 1. Get all tasks
@app.get("/tasks")
def get_tasks():
    db = get_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM tasks")
    tasks = cursor.fetchall()

    cursor.close()
    db.close()

    return tasks


# 2. Add a new task
@app.post("/tasks")
def add_task(task: Task):
    if not task.title.strip():
        raise HTTPException(400, "Title is required")

    db = get_connection()
    cursor = db.cursor()

    cursor.execute(
        "INSERT INTO tasks (title, description, completed) VALUES (%s, %s, %s)",
        (task.title, task.description, task.completed)
    )

    db.commit()

    new_id = cursor.lastrowid

    cursor.close()
    db.close()

    return {"message": "Task added successfully", "id": new_id}


# 3. Update a task
@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: Task):
    db = get_connection()
    cursor = db.cursor()

    cursor.execute(
        "UPDATE tasks SET title=%s, description=%s, completed=%s WHERE id=%s",
        (task.title, task.description, task.completed, task_id)
    )

    db.commit()

    if cursor.rowcount == 0:
        cursor.close()
        db.close()
        raise HTTPException(404, "Task not found")

    cursor.close()
    db.close()

    return {"message": "Task updated successfully"}


# 4. Delete a task
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    db = get_connection()
    cursor = db.cursor()

    cursor.execute(
        "DELETE FROM tasks WHERE id=%s",
        (task_id,)
    )

    db.commit()

    if cursor.rowcount == 0:
        cursor.close()
        db.close()
        raise HTTPException(404, "Task not found")

    cursor.close()
    db.close()

    return {"message": "Task deleted successfully"}