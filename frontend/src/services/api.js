import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_BASE });

export const employeeApi = {
  list: () => api.get("/api/employees"),
  create: (data) => api.post("/api/employees", data),
  delete: (id) => api.delete(`/api/employees/${id}`),
};

export const attendanceApi = {
  mark: (data) => api.post("/api/attendance", data),
  getByEmployee: (id, params) => api.get(`/api/attendance/${id}`, { params }),
};

export const dashboardApi = {
  summary: () => api.get("/api/dashboard/summary"),
};
