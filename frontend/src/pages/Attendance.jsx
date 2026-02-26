import { useState, useEffect } from "react";
import { employeeApi, attendanceApi } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import { TableSkeleton, FilterSkeleton } from "../components/Skeleton";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import Toast from "../components/Toast";
import { formatDate } from "../utils/formatDate";
import usePageTitle from "../hooks/usePageTitle";

const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

const INITIAL_MARK_FORM = {
  employee_id: "",
  date: today,
  status: "Present",
};

export default function Attendance() {
  usePageTitle("Attendance");
  // ── Employee list state ──
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState(null);

  // ── Filter state ──
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ── Attendance data state ──
  const [attendance, setAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);

  // ── Mark Attendance modal state ──
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markForm, setMarkForm] = useState(INITIAL_MARK_FORM);
  const [markError, setMarkError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Notification state ──
  const [notification, setNotification] = useState(null);

  // ── Fetch employee list on mount ──
  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    setEmployeesError(null);
    try {
      const res = await employeeApi.list();
      setEmployees(res.data);
    } catch (err) {
      setEmployeesError(
        err.response?.data?.detail || "Failed to load employees."
      );
    } finally {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ── Fetch attendance when employee or date range changes ──
  const fetchAttendance = async (empId, start, end) => {
    if (!empId) {
      setAttendance([]);
      return;
    }
    setAttendanceLoading(true);
    setAttendanceError(null);
    try {
      const params = {};
      if (start) params.start_date = start;
      if (end) params.end_date = end;
      const res = await attendanceApi.getByEmployee(empId, params);
      setAttendance(res.data);
    } catch (err) {
      setAttendanceError(
        err.response?.data?.detail || "Failed to load attendance records."
      );
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedEmployee, startDate, endDate);
  }, [selectedEmployee, startDate, endDate]);

  // ── Notification helper ──
  const showNotification = (message) => setNotification(message);

  // ── Summary stats ──
  const presentCount = attendance.filter((r) => r.status === "Present").length;
  const absentCount = attendance.filter((r) => r.status === "Absent").length;
  const totalCount = attendance.length;

  // ── Mark Attendance handlers ──
  const handleMarkFormChange = (e) => {
    setMarkForm({ ...markForm, [e.target.name]: e.target.value });
  };

  const openMarkModal = () => {
    setMarkForm({
      ...INITIAL_MARK_FORM,
      employee_id: selectedEmployee || "",
      date: today,
    });
    setMarkError(null);
    setShowMarkModal(true);
  };

  const closeMarkModal = () => {
    setShowMarkModal(false);
    setMarkForm(INITIAL_MARK_FORM);
    setMarkError(null);
  };

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    setMarkError(null);
    setSubmitting(true);
    try {
      await attendanceApi.mark({
        employee_id: markForm.employee_id,
        date: markForm.date,
        status: markForm.status,
      });
      closeMarkModal();
      showNotification("Attendance marked successfully!");
      // Refresh attendance if the marked employee is currently selected
      if (markForm.employee_id === selectedEmployee) {
        fetchAttendance(selectedEmployee, startDate, endDate);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 409) {
        setMarkError(
          typeof detail === "string"
            ? detail
            : "Attendance already marked for this employee on this date."
        );
      } else if (typeof detail === "string") {
        setMarkError(detail);
      } else if (Array.isArray(detail)) {
        setMarkError(detail.map((d) => d.msg).join(", "));
      } else {
        setMarkError("Failed to mark attendance. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render: initial employees loading ──
  if (employeesLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
        </div>
        <FilterSkeleton />
        <TableSkeleton rows={5} cols={2} />
      </div>
    );
  }

  // ── Render: employees fetch error ──
  if (employeesError) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Attendance</h1>
        <ErrorMessage message={employeesError} onRetry={fetchEmployees} />
      </div>
    );
  }

  return (
    <div>
      {/* ── Success notification ── */}
      {notification && <Toast message={notification} onDismiss={() => setNotification(null)} />}

      {/* ── Page header ── */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
        <button
          onClick={openMarkModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Mark Attendance
        </button>
      </div>

      {/* ── Filter section ── */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Employee dropdown */}
          <div>
            <label
              htmlFor="employee-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Employee
            </label>
            <select
              id="employee-select"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            >
              <option value="">Select an employee</option>
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.full_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label
              htmlFor="start-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            />
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="end-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* ── Content area ── */}
      {!selectedEmployee ? (
        /* No employee selected */
        <EmptyState
          icon="👤"
          title="No Employee Selected"
          description="Select an employee to view their attendance records"
        />
      ) : attendanceLoading ? (
        /* Loading attendance */
        <LoadingSpinner message="Loading attendance records..." />
      ) : attendanceError ? (
        /* Attendance fetch error */
        <ErrorMessage
          message={attendanceError}
          onRetry={() =>
            fetchAttendance(selectedEmployee, startDate, endDate)
          }
        />
      ) : attendance.length === 0 ? (
        /* No records for selected employee */
        <EmptyState
          icon="📋"
          title="No Records Found"
          description="No attendance records found for this employee"
        />
      ) : (
        /* Attendance data */
        <>
          {/* ── Summary stats ── */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Total:{" "}
                <span className="font-semibold text-green-600">
                  {presentCount} Present
                </span>
                ,{" "}
                <span className="font-semibold text-red-600">
                  {absentCount} Absent
                </span>{" "}
                out of{" "}
                <span className="font-semibold text-gray-800">
                  {totalCount} records
                </span>
              </span>
            </div>
          </div>

          {/* ── Attendance table ── */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendance.map((record) => (
                  <tr
                    key={record.date}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Mark Attendance Modal ── */}
      <Modal
        isOpen={showMarkModal}
        onClose={closeMarkModal}
        title="Mark Attendance"
      >
        <form onSubmit={handleMarkSubmit} className="space-y-4">
          {markError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {markError}
            </div>
          )}

          {/* Employee */}
          <div>
            <label
              htmlFor="mark-employee"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Employee
            </label>
            <select
              id="mark-employee"
              name="employee_id"
              required
              autoFocus
              value={markForm.employee_id}
              onChange={handleMarkFormChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            >
              <option value="" disabled>
                Select an employee
              </option>
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.full_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="mark-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <input
              id="mark-date"
              name="date"
              type="date"
              required
              max={new Date().toISOString().split("T")[0]}
              value={markForm.date}
              onChange={handleMarkFormChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            />
          </div>

          {/* Status radio buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex gap-4">
              <label
                className={`flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-2.5 transition-colors ${
                  markForm.status === "Present"
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="Present"
                  checked={markForm.status === "Present"}
                  onChange={handleMarkFormChange}
                  className="accent-green-600"
                />
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    markForm.status === "Present"
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
                <span className="text-sm font-medium">Present</span>
              </label>
              <label
                className={`flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-2.5 transition-colors ${
                  markForm.status === "Absent"
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="Absent"
                  checked={markForm.status === "Absent"}
                  onChange={handleMarkFormChange}
                  className="accent-red-600"
                />
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    markForm.status === "Absent"
                      ? "bg-red-500"
                      : "bg-gray-300"
                  }`}
                />
                <span className="text-sm font-medium">Absent</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeMarkModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Mark Attendance"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
