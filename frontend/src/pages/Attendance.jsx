import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, UserSearch, ClipboardList } from "lucide-react";
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
import DatePicker from "../components/DatePicker";

const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

const INITIAL_MARK_FORM = {
  employee_id: "",
  date: today,
  status: "Present",
};

export default function Attendance() {
  usePageTitle("Attendance");
  const [searchParams] = useSearchParams();

  // ── Employee list state ──
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState(null);

  // ── Filter state ──
  const [selectedEmployee, setSelectedEmployee] = useState(searchParams.get("employee") || "");
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

  // ── Toggle loading state ──
  const [togglingDate, setTogglingDate] = useState(null);

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
    if (start && end && start > end) {
      setAttendanceError("Start date must be before or equal to end date.");
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

  // ── Toggle attendance status ──
  const handleToggleStatus = async (record) => {
    const newStatus = record.status === "Present" ? "Absent" : "Present";
    if (!window.confirm(`Change ${record.date} from ${record.status} to ${newStatus}?`)) return;
    setTogglingDate(record.date);
    try {
      await attendanceApi.update(record.employee_id, record.date, { status: newStatus });
      showNotification(`Attendance updated to ${newStatus}`);
      fetchAttendance(selectedEmployee, startDate, endDate);
    } catch (err) {
      setAttendanceError(err.response?.data?.detail || "Failed to update attendance.");
    } finally {
      setTogglingDate(null);
    }
  };

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

  const validateMarkForm = () => {
    if (!markForm.employee_id) return "Please select an employee.";
    if (!markForm.date) return "Please select a date.";
    if (!markForm.status) return "Please select a status.";
    return null;
  };

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateMarkForm();
    if (validationError) { setMarkError(validationError); return; }
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Attendance</h1>
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Attendance</h1>
        <ErrorMessage message={employeesError} onRetry={fetchEmployees} />
      </div>
    );
  }

  return (
    <div>
      {/* ── Success notification ── */}
      {notification && <Toast message={notification} onDismiss={() => setNotification(null)} />}

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Attendance</h1>
        <button
          onClick={openMarkModal}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Mark Attendance
        </button>
      </div>

      {/* ── Filter section ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Employee dropdown */}
          <div>
            <label
              htmlFor="employee-select"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Employee
            </label>
            <select
              id="employee-select"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow dark:bg-gray-700 dark:text-gray-100"
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
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Start Date
            </label>
            <DatePicker
              id="start-date"
              name="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="end-date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              End Date
            </label>
            <DatePicker
              id="end-date"
              name="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Content area ── */}
      {!selectedEmployee ? (
        /* No employee selected */
        <EmptyState
          icon={UserSearch}
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
          icon={ClipboardList}
          title="No Records Found"
          description="No attendance records found for this employee"
        />
      ) : (
        /* Attendance data */
        <>
          {/* ── Employee context header ── */}
          {(() => {
            const emp = employees.find(e => e.employee_id === selectedEmployee);
            return emp ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Showing records for{" "}
                <Link to={`/employees?search=${emp.employee_id}`} className="font-semibold text-teal-600 hover:text-teal-800 transition-colors">
                  {emp.full_name}
                </Link>{" "}
                ({emp.employee_id})
              </p>
            ) : null;
          })()}

          {/* ── Summary stats ── */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Total:{" "}
                <span className="font-semibold text-green-600">
                  {presentCount} Present
                </span>
                ,{" "}
                <span className="font-semibold text-red-600">
                  {absentCount} Absent
                </span>{" "}
                out of{" "}
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {totalCount} records
                </span>
              </span>
            </div>
          </div>

          {/* ── Attendance table ── */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase px-6 py-3">
                      Date
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase px-6 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {attendance.map((record) => (
                    <tr
                      key={record.date}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(record)}
                          disabled={togglingDate === record.date}
                          className={`cursor-pointer transition-opacity rounded focus:ring-2 focus:ring-teal-500 focus:outline-none ${togglingDate === record.date ? "opacity-50" : "hover:opacity-80"}`}
                          title={`Click to change to ${record.status === "Present" ? "Absent" : "Present"}`}
                        >
                          <StatusBadge status={record.status} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Mark Attendance Modal ── */}
      <Modal
        isOpen={showMarkModal}
        onClose={closeMarkModal}
        title="Mark Attendance"
      >
        <form onSubmit={handleMarkSubmit} noValidate className="space-y-4">
          {markError && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-lg p-3">
              {markError}
            </div>
          )}

          {/* Employee */}
          <div>
            <label
              htmlFor="mark-employee"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Employee
            </label>
            <select
              id="mark-employee"
              name="employee_id"
              value={markForm.employee_id}
              onChange={handleMarkFormChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow dark:bg-gray-700 dark:text-gray-100"
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
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Date
            </label>
            <DatePicker
              id="mark-date"
              name="date"
              value={markForm.date}
              onChange={handleMarkFormChange}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Status radio buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Status
            </label>
            <div className="flex gap-4">
              <label
                className={`flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-2.5 transition-colors ${
                  markForm.status === "Present"
                    ? "border-green-300 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                    ? "border-red-300 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Mark Attendance"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
