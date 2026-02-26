import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000, // 15 seconds — handles Render cold starts
});

// Response interceptor for better error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.message = "Request timed out. The server may be starting up — please try again.";
    } else if (!error.response) {
      error.message = "Unable to connect to server. Please check your connection and try again.";
    }
    return Promise.reject(error);
  }
);

export const employeeApi = {
  list: () => api.get("/api/employees"),
  create: (data) => api.post("/api/employees", data),
  delete: (id) => api.delete(`/api/employees/${id}`),
};

export const attendanceApi = {
  mark: (data) => api.post("/api/attendance", data),
  update: (empId, date, data) => api.put(`/api/attendance/${empId}/${date}`, data),
  getByEmployee: (id, params) => api.get(`/api/attendance/${id}`, { params }),
};

export const dashboardApi = {
  summary: () => api.get("/api/dashboard/summary"),
};
