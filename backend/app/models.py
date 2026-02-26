from datetime import datetime
from enum import Enum
from pydantic import BaseModel, EmailStr, Field


class Department(str, Enum):
    ENGINEERING = "Engineering"
    MARKETING = "Marketing"
    SALES = "Sales"
    HR = "Human Resources"
    FINANCE = "Finance"
    OPERATIONS = "Operations"
    DESIGN = "Design"
    OTHER = "Other"


class AttendanceStatus(str, Enum):
    PRESENT = "Present"
    ABSENT = "Absent"


class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=20, pattern=r"^[A-Za-z0-9-]+$")
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    department: Department


class EmployeeResponse(BaseModel):
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime


class AttendanceCreate(BaseModel):
    employee_id: str = Field(..., min_length=1)
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    status: AttendanceStatus


class AttendanceResponse(BaseModel):
    employee_id: str
    date: str
    status: str
    created_at: datetime


class DepartmentCount(BaseModel):
    department: str
    count: int


class DashboardSummary(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    unmarked_today: int
    departments: list[DepartmentCount]
