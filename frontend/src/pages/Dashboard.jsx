import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, UserCheck, UserX, Clock, Plus, ChevronRight } from "lucide-react";
import { dashboardApi } from "../services/api";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import Modal from "../components/Modal";
import { CardSkeleton, TableSkeleton } from "../components/Skeleton";
import usePageTitle from "../hooks/usePageTitle";

export default function Dashboard() {
  usePageTitle("Dashboard");
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailModal, setDetailModal] = useState(null); // { title, employees, color }
  const [todayDetails, setTodayDetails] = useState(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryRes, detailsRes] = await Promise.all([
        dashboardApi.summary(),
        dashboardApi.todayDetails(),
      ]);
      setSummary(summaryRes.data);
      setTodayDetails(detailsRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <CardSkeleton count={4} />
        <div className="mt-6"><TableSkeleton rows={4} cols={2} /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <ErrorMessage message={error} onRetry={fetchSummary} />
      </div>
    );
  }

  if (summary && summary.total_employees === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <EmptyState
          icon={Users}
          title="No employees yet"
          description="No employees yet. Add employees to see dashboard stats."
        />
        <div className="flex justify-center mt-4">
          <Link
            to="/employees"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Employees
          </Link>
        </div>
      </div>
    );
  }

  const handleCardClick = (key) => {
    if (key === "total") {
      navigate("/employees");
      return;
    }
    if (!todayDetails) return;
    const map = {
      present: { title: "Present Today", employees: todayDetails.present, color: "text-green-600" },
      absent: { title: "Absent Today", employees: todayDetails.absent, color: "text-red-600" },
      unmarked: { title: "Unmarked Today", employees: todayDetails.unmarked, color: "text-amber-600" },
    };
    setDetailModal(map[key] || null);
  };

  const statCards = [
    {
      label: "Total Employees",
      value: summary.total_employees,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      icon: Users,
      key: "total",
    },
    {
      label: "Present Today",
      value: summary.present_today,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      icon: UserCheck,
      key: "present",
    },
    {
      label: "Absent Today",
      value: summary.absent_today,
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      icon: UserX,
      key: "absent",
    },
    {
      label: "Unmarked Today",
      value: summary.unmarked_today,
      bgColor: "bg-amber-100",
      textColor: "text-amber-600",
      icon: Clock,
      key: "unmarked",
    },
  ];

  const departments = summary.departments
    ? [...summary.departments].sort((a, b) => b.count - a.count)
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.label}
              onClick={() => handleCardClick(card.key)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex items-center gap-4 cursor-pointer group"
            >
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full ${card.bgColor} ${card.textColor} shrink-0`}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
          );
        })}
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Department Overview
          </h2>
        </div>

        {departments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-400">No department data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                    Employees
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {departments.map((dept, index) => (
                  <tr
                    key={dept.department}
                    className={`${index % 2 === 1 ? "bg-gray-50" : "bg-white"} hover:bg-indigo-50 cursor-pointer transition-colors`}
                    onClick={() => navigate("/employees?search=" + encodeURIComponent(dept.department))}
                  >
                    <td className="px-6 py-3 text-sm text-gray-800">
                      {dept.department}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-right font-medium">
                      {dept.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Stat Card Detail Modal ── */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal?.title || ""}>
        {detailModal && (
          <div>
            {detailModal.employees.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No employees in this category today.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {detailModal.employees.map((emp) => (
                  <li key={emp.employee_id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{emp.full_name}</p>
                      <p className="text-xs text-gray-500">{emp.employee_id}</p>
                    </div>
                    <Link
                      to={`/attendance`}
                      onClick={() => setDetailModal(null)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      View Attendance
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
