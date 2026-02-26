from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from pymongo.errors import DuplicateKeyError
from app.database import employees_collection, attendance_collection
from app.models import AttendanceCreate, AttendanceResponse

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


@router.post("/", response_model=AttendanceResponse, status_code=201, summary="Mark attendance", description="Records attendance for an employee on a specific date. Returns 409 if already marked for that date.")
async def mark_attendance(attendance: AttendanceCreate):
    employee = await employees_collection.find_one({"employee_id": attendance.employee_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    doc = {
        "employee_id": attendance.employee_id,
        "date": attendance.date,
        "status": attendance.status.value,
        "created_at": datetime.now(timezone.utc),
    }
    try:
        await attendance_collection.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail=f"Attendance already marked for {attendance.employee_id} on {attendance.date}",
        )
    return AttendanceResponse(**doc)


@router.get("/{employee_id}", response_model=list[AttendanceResponse], summary="Get attendance records", description="Returns attendance records for an employee, sorted by date (newest first). Supports optional start_date and end_date query parameters for filtering.")
async def get_attendance(
    employee_id: str,
    start_date: str | None = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    end_date: str | None = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
):
    employee = await employees_collection.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    query: dict = {"employee_id": employee_id}
    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            date_filter["$lte"] = end_date
        query["date"] = date_filter

    records = []
    async for rec in attendance_collection.find(query).sort("date", -1):
        records.append(AttendanceResponse(
            employee_id=rec["employee_id"],
            date=rec["date"],
            status=rec["status"],
            created_at=rec["created_at"],
        ))
    return records
