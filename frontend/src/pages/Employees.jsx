import { useState, useEffect } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { employeeApi } from "../services/api";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import { TableSkeleton } from "../components/Skeleton";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import usePageTitle from "../hooks/usePageTitle";

const DEPARTMENTS = [
  "Engineering",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
  "Design",
  "Other",
];

const INITIAL_FORM = {
  employee_id: "",
  full_name: "",
  email: "",
  department: "",
};

export default function Employees() {
  usePageTitle("Employees");
  // ── Data state ──
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Modal / dialog state ──
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // employee object

  // ── Form state ──
  const [form, setForm] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Notification state ──
  const [notification, setNotification] = useState(null);

  // ── Fetch employees ──
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await employeeApi.list();
      setEmployees(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ── Notification helper ──
  const showNotification = (message) => setNotification(message);

  // ── Add employee ──
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.employee_id.trim()) return "Employee ID is required.";
    if (!/^[A-Za-z0-9-]+$/.test(form.employee_id)) return "Employee ID can only contain letters, numbers, and hyphens.";
    if (form.employee_id.length > 20) return "Employee ID must be 20 characters or less.";
    if (!form.full_name.trim()) return "Full Name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email address.";
    if (!form.department) return "Please select a department.";
    return null;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { setFormError(validationError); return; }
    setFormError(null);
    setSubmitting(true);
    try {
      await employeeApi.create(form);
      setShowAddModal(false);
      setForm(INITIAL_FORM);
      showNotification("Employee added successfully!");
      await fetchEmployees();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        setFormError(detail);
      } else if (Array.isArray(detail)) {
        setFormError(detail.map((d) => d.msg).join(", "));
      } else {
        setFormError("Failed to add employee. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setForm(INITIAL_FORM);
    setFormError(null);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setForm(INITIAL_FORM);
    setFormError(null);
  };

  // ── Delete employee ──
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await employeeApi.delete(deleteTarget.employee_id);
      setDeleteTarget(null);
      showNotification("Employee deleted successfully!");
      await fetchEmployees();
    } catch (err) {
      setDeleteTarget(null);
      setError(
        err.response?.data?.detail || "Failed to delete employee."
      );
    }
  };

  // ── Render: loading ──
  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
        </div>
        <TableSkeleton rows={5} cols={5} />
      </div>
    );
  }

  // ── Render: error (full-page) ──
  if (error && employees.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Employees</h1>
        <ErrorMessage message={error} onRetry={fetchEmployees} />
      </div>
    );
  }

  return (
    <div>
      {/* ── Success notification ── */}
      {notification && <Toast message={notification} onDismiss={() => setNotification(null)} />}

      {/* ── Page header ── */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      {/* ── Inline error (e.g. delete failed but list still visible) ── */}
      {error && employees.length > 0 && (
        <div className="mb-4">
          <ErrorMessage message={error} onRetry={fetchEmployees} />
        </div>
      )}

      {/* ── Empty state ── */}
      {employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Employees"
          description="No employees yet. Click 'Add Employee' to get started."
        />
      ) : (
        /* ── Employee table ── */
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Employees</h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {employees.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Employee ID
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Full Name
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Department
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((emp) => (
                  <tr
                    key={emp.employee_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-gray-700">
                      {emp.employee_id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {emp.full_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {emp.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setDeleteTarget(emp)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2 transition-colors cursor-pointer"
                        aria-label={`Delete ${emp.full_name}`}
                        title={`Delete ${emp.full_name}`}
                      >
                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add Employee Modal ── */}
      <Modal isOpen={showAddModal} onClose={closeAddModal} title="Add Employee">
        <form onSubmit={handleAddSubmit} noValidate className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {formError}
            </div>
          )}

          {/* Employee ID */}
          <div>
            <label
              htmlFor="employee_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Employee ID
            </label>
            <input
              id="employee_id"
              name="employee_id"
              type="text"
              autoFocus
              maxLength={20}
              value={form.employee_id}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
              placeholder="e.g. EMP001"
            />
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
              placeholder="e.g. John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="text"
              value={form.email}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
              placeholder="e.g. john@company.com"
            />
          </div>

          {/* Department */}
          <div>
            <label
              htmlFor="department"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Department
            </label>
            <select
              id="department"
              name="department"
              value={form.department}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            >
              <option value="" disabled>
                Select a department
              </option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeAddModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Adding..." : "Add Employee"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.full_name}"? This action cannot be undone.`
            : "Are you sure? This action cannot be undone."
        }
      />
    </div>
  );
}
