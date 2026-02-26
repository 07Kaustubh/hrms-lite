from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_indexes
from app.routes import employees, attendance, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await create_indexes()
    except Exception as e:
        print(f"Warning: Failed to create indexes on startup: {e}")
    yield


app = FastAPI(title="HRMS Lite API", version="1.0.0", lifespan=lifespan)

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
