from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.mongodb_uri)
db = client[settings.database_name]

employees_collection = db["employees"]
attendance_collection = db["attendance"]


async def create_indexes():
    await employees_collection.create_index("employee_id", unique=True)
    await employees_collection.create_index("email", unique=True)
    await attendance_collection.create_index(
        [("employee_id", 1), ("date", 1)], unique=True
    )
