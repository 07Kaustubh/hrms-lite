from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_indexes, client, db
from app.routes import employees, attendance, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await create_indexes()
    except Exception as e:
        print(f"Warning: Failed to create indexes on startup: {e}")
    yield
    # Graceful shutdown
    client.close()


tags_metadata = [
    {"name": "employees", "description": "Employee management — add, view, and delete employee records"},
    {"name": "attendance", "description": "Attendance tracking — mark and view daily attendance records"},
    {"name": "dashboard", "description": "Dashboard statistics and data seeding"},
]

app = FastAPI(
    title="HRMS Lite API",
    version="1.0.0",
    description="A lightweight Human Resource Management System API for managing employees and tracking daily attendance.",
    lifespan=lifespan,
    openapi_tags=tags_metadata,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)


@app.get("/")
async def root():
    return {"message": "HRMS Lite API is running"}


@app.get("/api/health")
async def health_check():
    try:
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "disconnected"}
        )
