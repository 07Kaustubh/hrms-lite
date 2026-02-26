# HRMS Lite

A lightweight Human Resource Management System for managing employee records and tracking daily attendance. Built as a full-stack application with a professional, production-ready interface.

## Live Demo

- **Application:** [https://frontend-seven-theta-75.vercel.app](https://frontend-seven-theta-75.vercel.app)
- **API Documentation:** [https://hrms-lite-api-v346.onrender.com/docs](https://hrms-lite-api-v346.onrender.com/docs)
- **Health Check:** [https://hrms-lite-api-v346.onrender.com/api/health](https://hrms-lite-api-v346.onrender.com/api/health)

> **Note:** The backend is hosted on Render's free tier and may take 30-60 seconds to wake up on the first request after inactivity. Subsequent requests will be fast.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.2.0 |
| Build Tool | Vite | 7.3.1 |
| Styling | Tailwind CSS | 4.2.1 |
| Routing | React Router | 7.13.1 |
| HTTP Client | Axios | 1.13.5 |
| Icons | Lucide React | 0.575.0 |
| Backend | FastAPI | 0.115.0 |
| ASGI Server | Uvicorn | 0.30.6 |
| Async MongoDB Driver | Motor | 3.7.1 |
| Validation | Pydantic | 2.9.1 |
| Database | MongoDB Atlas | — |
| Frontend Hosting | Vercel | — |
| Backend Hosting | Render | — |

## Features

### Core Functionality
- **Employee Management** — Add, view, and delete employee records with unique ID and email enforcement
- **Attendance Tracking** — Mark daily attendance (Present/Absent) per employee with duplicate prevention
- **Server-side Validation** — Required fields, email format (Pydantic EmailStr), whitespace rejection, date validation, pattern-matched employee IDs

### Bonus Features
- **Dashboard** — Interactive stat cards with drill-down modals showing employee names per category
- **Date Filtering** — Filter attendance records by start and end date range
- **Present Day Counts** — Total present/absent summary displayed per employee
- **Employee Search** — Filter employees by name, ID, email, or department in real time
- **Attendance Editing** — Toggle attendance status (Present/Absent) by clicking the status badge
- **Employee Detail Modal** — Click any employee row to see details with "View Attendance" link
- **Department Drill-Down** — Click a department in the dashboard to filter employees by that department
- **Connected Navigation** — All links carry context (department filters, employee pre-selection, post-add CTA)

### UI/UX Polish
- **Responsive Design** — Mobile card layout for employees, collapsible sidebar, stacking headers on small screens
- **Custom Date Picker** — React Day Picker replaces native date inputs; closes on outside click, shows human-readable dates
- **Skeleton Loading** — Animated skeleton screens for tables and cards during data fetches
- **Error Boundary** — React error boundary with focus restoration on close
- **404 Page** — Custom not-found page for undefined routes
- **Modal Animations** — Fade-in/scale-in transitions, Escape key dismissal, auto-focus, scroll on overflow, focus restore
- **Toast Notifications** — Slide-in success notifications with action links and auto-dismiss
- **Lucide Icons** — Professional SVG icon library throughout
- **Inter Font** — Custom typography via Google Fonts
- **Code Splitting** — Lazy-loaded route pages via React.lazy + Suspense
- **Dynamic Page Titles** — Browser tab updates per page
- **Accessible** — ARIA labels, role="alert", aria-modal, focus rings on all interactive elements, keyboard navigation
- **Custom Validation** — No native browser popups; inline styled error messages with date range validation
- **Toggle Confirmation** — Attendance status changes require confirmation before saving

### Backend Hardening
- **Health Check** — `GET /api/health` verifies MongoDB connectivity (returns 503 if disconnected)
- **Connection Pooling** — Motor configured with maxPoolSize, minPoolSize, and timeouts
- **Graceful Shutdown** — MongoDB client closed cleanly on app termination
- **Seed Data** — Pre-populated with 10 employees and 3 weeks of attendance records

## Project Structure

```
hrms-lite/
├── frontend/                    # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/          # 11 reusable UI components
│   │   │   ├── Sidebar.jsx      # Responsive sidebar with mobile overlay
│   │   │   ├── Layout.jsx       # App shell with hamburger menu
│   │   │   ├── Modal.jsx        # Animated modal with Escape + auto-focus
│   │   │   ├── Toast.jsx        # Slide-in success notifications
│   │   │   ├── Skeleton.jsx     # Table/card/filter skeleton loaders
│   │   │   ├── EmptyState.jsx   # Empty state with Lucide icons
│   │   │   ├── ErrorMessage.jsx # Error display with retry button
│   │   │   ├── ErrorBoundary.jsx# React error boundary
│   │   │   ├── ConfirmDialog.jsx# Delete confirmation dialog
│   │   │   ├── StatusBadge.jsx  # Present/Absent colored badge
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/               # 4 route pages (lazy-loaded)
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Employees.jsx
│   │   │   ├── Attendance.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/api.js      # Axios client with timeout + interceptors
│   │   ├── hooks/usePageTitle.js # Dynamic document.title hook
│   │   ├── utils/formatDate.js  # UTC-safe date formatting
│   │   ├── App.jsx              # Router + ErrorBoundary + Suspense
│   │   ├── main.jsx
│   │   └── index.css            # Tailwind import + keyframe animations
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json              # SPA rewrite rules
│   └── package.json
├── backend/                     # FastAPI + Motor (async MongoDB)
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, lifespan, health check
│   │   ├── config.py            # Pydantic Settings (env vars)
│   │   ├── database.py          # Motor client with connection pooling
│   │   ├── models.py            # Pydantic request/response schemas
│   │   ├── seed.py              # Database seeding script
│   │   └── routes/
│   │       ├── employees.py     # Employee CRUD endpoints
│   │       ├── attendance.py    # Attendance endpoints with date filtering
│   │       └── dashboard.py     # Dashboard summary + seed endpoint
│   ├── requirements.txt
│   ├── .python-version          # Pins Python 3.11 for Render
│   ├── .env.example
│   ├── Procfile
│   └── render.yaml
└── README.md
```

## Running Locally

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- MongoDB (local instance or Atlas connection string)

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# Start the server
uvicorn app.main:app --reload
# API: http://localhost:8000
# Swagger docs: http://localhost:8000/docs

# (Optional) Seed sample data
python -m app.seed
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App: http://localhost:5173
```

To point the frontend at a different backend, create `frontend/.env.local`:
```
VITE_API_URL=http://localhost:8000
```

## API Endpoints

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|-------------|
| `GET` | `/api/employees` | List all employees | 200 |
| `POST` | `/api/employees` | Add a new employee | 201, 409, 422 |
| `DELETE` | `/api/employees/:id` | Delete employee and their attendance | 200, 404 |
| `GET` | `/api/attendance/:id` | Get attendance records (optional `start_date`, `end_date` query params) | 200, 404 |
| `POST` | `/api/attendance` | Mark attendance | 201, 404, 409, 422 |
| `PUT` | `/api/attendance/:id/:date` | Update attendance status (toggle Present/Absent) | 200, 404 |
| `GET` | `/api/dashboard/summary` | Dashboard statistics | 200 |
| `GET` | `/api/dashboard/today-details` | Today's attendance grouped by status with employee names | 200 |
| `POST` | `/api/dashboard/seed` | Seed sample data (idempotent) | 200 |
| `GET` | `/api/health` | Health check (MongoDB ping) | 200, 503 |

### Error Responses

All errors return JSON with a `detail` field:
```json
{ "detail": "Employee with this ID already exists" }
```

Validation errors (422) include field-level details:
```json
{
  "detail": [
    { "loc": ["body", "email"], "msg": "value is not a valid email address", "type": "value_error" }
  ]
}
```

## Database Schema

### employees Collection
| Field | Type | Constraints |
|-------|------|------------|
| employee_id | string | Unique, alphanumeric + hyphens, max 20 chars |
| full_name | string | Required, 1-100 chars, whitespace-trimmed |
| email | string | Unique, valid email format |
| department | string | One of 8 predefined departments |
| created_at | datetime | Auto-set on creation (UTC) |

### attendance Collection
| Field | Type | Constraints |
|-------|------|------------|
| employee_id | string | Must reference existing employee |
| date | string | YYYY-MM-DD, must be a valid calendar date |
| status | string | "Present" or "Absent" |
| created_at | datetime | Auto-set on creation (UTC) |

**Indexes:** Unique on `employee_id`, unique on `email`, unique compound on `(employee_id, date)`

## Assumptions & Limitations

- **Single admin user** — No authentication required (per assignment specification)
- **No leave/payroll** — Leave management, payroll, and advanced HR features are out of scope
- **Predefined departments** — Engineering, Marketing, Sales, Human Resources, Finance, Operations, Design, Other
- **CORS** — Configured to allow all origins for demo/evaluation purposes
- **Render free tier** — Backend may experience 30-60 second cold start after inactivity
- **No pagination** — Lists return all records (sufficient for the assignment's intended scale)
