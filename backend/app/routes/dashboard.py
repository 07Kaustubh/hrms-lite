from datetime import date
from fastapi import APIRouter
from app.database import employees_collection, attendance_collection
from app.models import DashboardSummary, DepartmentCount

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_summary():
    total_employees = await employees_collection.count_documents({})
    today = date.today().isoformat()

    present_today = await attendance_collection.count_documents({"date": today, "status": "Present"})
    absent_today = await attendance_collection.count_documents({"date": today, "status": "Absent"})
    unmarked_today = total_employees - present_today - absent_today

    pipeline = [
        {"$group": {"_id": "$department", "count": {"$sum": 1}}}
    ]
    departments = []
    async for doc in employees_collection.aggregate(pipeline):
        departments.append(DepartmentCount(department=doc["_id"], count=doc["count"]))

    return DashboardSummary(
        total_employees=total_employees,
        present_today=present_today,
        absent_today=absent_today,
        unmarked_today=unmarked_today,
        departments=departments,
    )
