from datetime import date
from fastapi import APIRouter
from app.database import employees_collection, attendance_collection
from app.models import DashboardSummary

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_summary():
    total_employees = await employees_collection.count_documents({})
    today = date.today().isoformat()

    today_present = await attendance_collection.count_documents({"date": today, "status": "Present"})
    today_absent = await attendance_collection.count_documents({"date": today, "status": "Absent"})
    today_unmarked = total_employees - today_present - today_absent

    pipeline = [
        {"$group": {"_id": "$department", "count": {"$sum": 1}}}
    ]
    department_counts = {}
    async for doc in employees_collection.aggregate(pipeline):
        department_counts[doc["_id"]] = doc["count"]

    return DashboardSummary(
        total_employees=total_employees,
        today_present=today_present,
        today_absent=today_absent,
        today_unmarked=today_unmarked,
        department_counts=department_counts,
    )
