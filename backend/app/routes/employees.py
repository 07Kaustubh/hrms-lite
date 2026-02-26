from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pymongo.errors import DuplicateKeyError
from app.database import employees_collection, attendance_collection
from app.models import EmployeeCreate, EmployeeResponse

router = APIRouter(prefix="/api/employees", tags=["employees"])


@router.get("/", response_model=list[EmployeeResponse], summary="List all employees", description="Returns all employees sorted by creation date (newest first).")
async def list_employees():
    employees = []
    async for emp in employees_collection.find().sort("created_at", -1):
        employees.append(EmployeeResponse(
            employee_id=emp["employee_id"],
            full_name=emp["full_name"],
            email=emp["email"],
            department=emp["department"],
            created_at=emp["created_at"],
        ))
    return employees


@router.post("/", response_model=EmployeeResponse, status_code=201, summary="Add a new employee", description="Creates an employee with unique ID and email. Returns 409 if either already exists.")
async def create_employee(employee: EmployeeCreate):
    doc = {
        "employee_id": employee.employee_id,
        "full_name": employee.full_name,
        "email": employee.email,
        "department": employee.department.value,
        "created_at": datetime.now(timezone.utc),
    }
    try:
        await employees_collection.insert_one(doc)
    except DuplicateKeyError:
        existing = await employees_collection.find_one({
            "$or": [
                {"employee_id": employee.employee_id},
                {"email": employee.email},
            ]
        })
        if existing and existing["employee_id"] == employee.employee_id:
            raise HTTPException(status_code=409, detail="Employee with this ID already exists")
        raise HTTPException(status_code=409, detail="Employee with this email already exists")
    return EmployeeResponse(**doc)


@router.delete("/{employee_id}", status_code=200, summary="Delete an employee", description="Removes the employee and all their attendance records. Returns 404 if not found.")
async def delete_employee(employee_id: str):
    result = await employees_collection.delete_one({"employee_id": employee_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    await attendance_collection.delete_many({"employee_id": employee_id})
    return {"message": f"Employee {employee_id} and their attendance records deleted"}
