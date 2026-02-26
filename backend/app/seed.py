import asyncio
import random
from datetime import datetime, timezone, date, timedelta
from app.database import employees_collection, attendance_collection

SEED_EMPLOYEES = [
    {"employee_id": "EMP001", "full_name": "Aarav Sharma", "email": "aarav.sharma@company.com", "department": "Engineering"},
    {"employee_id": "EMP002", "full_name": "Priya Patel", "email": "priya.patel@company.com", "department": "Engineering"},
    {"employee_id": "EMP003", "full_name": "Rohan Gupta", "email": "rohan.gupta@company.com", "department": "Marketing"},
    {"employee_id": "EMP004", "full_name": "Ananya Singh", "email": "ananya.singh@company.com", "department": "Human Resources"},
    {"employee_id": "EMP005", "full_name": "Vikram Reddy", "email": "vikram.reddy@company.com", "department": "Sales"},
    {"employee_id": "EMP006", "full_name": "Sneha Joshi", "email": "sneha.joshi@company.com", "department": "Finance"},
    {"employee_id": "EMP007", "full_name": "Arjun Nair", "email": "arjun.nair@company.com", "department": "Engineering"},
    {"employee_id": "EMP008", "full_name": "Kavya Menon", "email": "kavya.menon@company.com", "department": "Design"},
    {"employee_id": "EMP009", "full_name": "Rahul Verma", "email": "rahul.verma@company.com", "department": "Operations"},
    {"employee_id": "EMP010", "full_name": "Ishita Kapoor", "email": "ishita.kapoor@company.com", "department": "Marketing"},
]


async def seed():
    print("Seeding database...")

    # Clear existing data
    await employees_collection.delete_many({})
    await attendance_collection.delete_many({})

    # Insert employees
    for emp in SEED_EMPLOYEES:
        emp["created_at"] = datetime.now(timezone.utc)
        await employees_collection.insert_one(emp)
    print(f"  Created {len(SEED_EMPLOYEES)} employees")

    # Generate attendance
    random.seed(42)
    today = date.today()
    count = 0
    for day_offset in range(21):
        d = today - timedelta(days=day_offset)
        if d.weekday() >= 5:  # Skip weekends
            continue
        date_str = d.isoformat()
        for emp in SEED_EMPLOYEES:
            roll = random.random()
            if roll < 0.05:  # 5% unmarked
                continue
            status = "Present" if roll < 0.85 else "Absent"
            await attendance_collection.insert_one({
                "employee_id": emp["employee_id"],
                "date": date_str,
                "status": status,
                "created_at": datetime.now(timezone.utc),
            })
            count += 1
    print(f"  Created {count} attendance records")
    print("Seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed())
