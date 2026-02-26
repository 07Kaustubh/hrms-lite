# HRMS Lite

A lightweight Human Resource Management System for managing employee records and tracking daily attendance.

## Live Demo

- **Frontend:** [Live Application](https://frontend-seven-theta-75.vercel.app)
- **Backend API:** [API Documentation](https://hrms-lite-api-v346.onrender.com/docs)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, Tailwind CSS 4, React Router 7, Axios, Lucide React |
| Backend | Python, FastAPI, Pydantic |
| Database | MongoDB Atlas (via Motor async driver) |
| Deployment | Vercel (frontend), Render (backend) |

## Features

### Core
- **Employee Management** — Add, view, and delete employee records
- **Attendance Tracking** — Mark daily attendance (Present/Absent) per employee
- **Server-side Validation** — Required fields, email format, duplicate prevention

### Bonus
- **Dashboard** — Summary stats with employee counts, today's attendance overview, department breakdown
- **Date Filtering** — Filter attendance records by date range
- **Present Day Counts** — Total present/absent summary per employee

## Project Structure

```
hrms-lite/
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Dashboard, Employees, Attendance
│   │   └── services/    # API client layer
│   └── package.json
├── backend/           # FastAPI + Motor (MongoDB)
│   ├── app/
│   │   ├── routes/      # API route handlers
│   │   ├── models.py    # Pydantic schemas
│   │   ├── database.py  # MongoDB connection
│   │   └── main.py      # FastAPI application
│   └── requirements.txt
└── README.md
```

## Running Locally

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas connection string)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB connection string

uvicorn app.main:app --reload
# API available at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

To connect to a different backend URL, create `frontend/.env.local`:
```
VITE_API_URL=http://localhost:8000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/employees | List all employees |
| POST | /api/employees | Add a new employee |
| DELETE | /api/employees/:id | Delete an employee |
| GET | /api/attendance/:id | Get attendance records |
| POST | /api/attendance | Mark attendance |
| GET | /api/dashboard/summary | Dashboard statistics |

## Assumptions & Limitations

- Single admin user (no authentication required per assignment spec)
- Leave management, payroll, and advanced HR features are out of scope
- CORS is configured to allow all origins for demo purposes
- Department list is predefined (Engineering, Marketing, Sales, HR, Finance, Operations, Design, Other)
