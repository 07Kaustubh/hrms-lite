from datetime import date
from fastapi import APIRouter
from app.database import employees_collection, attendance_collection
from app.models import DashboardSummary, DepartmentCount
from app.seed import seed as run_seed

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary, summary="Dashboard summary", description="Returns total employee count, today's attendance breakdown (present, absent, unmarked), and department-wise employee counts.")
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


@router.get("/today-details", summary="Today's attendance details", description="Returns employee names grouped by today's attendance status (present, absent, unmarked).")
async def get_today_details():
    today = date.today().isoformat()

    # Get all employees
    all_employees = {}
    async for emp in employees_collection.find():
        all_employees[emp["employee_id"]] = emp["full_name"]

    # Get today's attendance records
    marked = {}
    async for rec in attendance_collection.find({"date": today}):
        marked[rec["employee_id"]] = rec["status"]

    present = []
    absent = []
    unmarked = []
    for emp_id, name in all_employees.items():
        status = marked.get(emp_id)
        entry = {"employee_id": emp_id, "full_name": name}
        if status == "Present":
            present.append(entry)
        elif status == "Absent":
            absent.append(entry)
        else:
            unmarked.append(entry)

    return {"present": present, "absent": absent, "unmarked": unmarked}


@router.post("/seed", status_code=200, summary="Seed sample data", description="Clears existing data and populates the database with 10 sample employees and 3 weeks of attendance records. Idempotent.")
async def seed_database():
    await run_seed()
    return {"message": "Database seeded successfully"}
