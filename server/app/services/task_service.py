from app.database import get_db
from app.models import TaskCreate, TaskUpdate, TaskResponse
from datetime import datetime


def _row_to_task(row) -> TaskResponse:
    return TaskResponse(
        id=row["id"],
        title=row["title"],
        description=row["description"] or "",
        date=row["date"],
        time=row["time"],
        status=row["status"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


async def get_all_tasks() -> list[TaskResponse]:
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM tasks ORDER BY date ASC, time ASC"
        )
        rows = await cursor.fetchall()
        return [_row_to_task(r) for r in rows]
    finally:
        await db.close()


async def get_task_by_id(task_id: int) -> TaskResponse | None:
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        row = await cursor.fetchone()
        return _row_to_task(row) if row else None
    finally:
        await db.close()


async def create_task(data: TaskCreate) -> TaskResponse:
    db = await get_db()
    try:
        now = datetime.utcnow().isoformat()
        cursor = await db.execute(
            """INSERT INTO tasks (title, description, date, time, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (data.title, data.description, data.date, data.time, data.status, now, now),
        )
        await db.commit()
        return await get_task_by_id(cursor.lastrowid)
    finally:
        await db.close()


async def update_task(task_id: int, data: TaskUpdate) -> TaskResponse | None:
    existing = await get_task_by_id(task_id)
    if not existing:
        return None

    updates = data.model_dump(exclude_none=True)
    if not updates:
        return existing

    updates["updated_at"] = datetime.utcnow().isoformat()
    set_clause = ", ".join(f"{k} = ?" for k in updates)
    values = list(updates.values()) + [task_id]

    db = await get_db()
    try:
        await db.execute(f"UPDATE tasks SET {set_clause} WHERE id = ?", values)
        await db.commit()
        return await get_task_by_id(task_id)
    finally:
        await db.close()


async def delete_task(task_id: int) -> bool:
    db = await get_db()
    try:
        cursor = await db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        await db.commit()
        return cursor.rowcount > 0
    finally:
        await db.close()
