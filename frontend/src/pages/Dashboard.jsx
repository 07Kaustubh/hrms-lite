import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, UserCheck, UserX, Clock, Plus, ChevronRight } from "lucide-react";
import { dashboardApi } from "../services/api";
import EmptyState from "../components/EmptyState";
import ErrorMessage from "../components/ErrorMessage";
import Modal from "../components/Modal";
import { CardSkeleton, TableSkeleton } from "../components/Skeleton";
import usePageTitle from "../hooks/usePageTitle";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Attendance Donut */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Attendance</h2>
          {summary.total_employees > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Present", value: summary.present_today, color: "#059669" },
                      { name: "Absent", value: summary.absent_today, color: "#DC2626" },
                      { name: "Unmarked", value: summary.unmarked_today, color: "#D97706" },
                    ].filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {[
                      { color: "#059669" },
                      { color: "#DC2626" },
                      { color: "#D97706" },
                    ].filter((_, i) => [summary.present_today, summary.absent_today, summary.unmarked_today][i] > 0)
                     .map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-600" />
                  <span className="text-xs text-gray-600">Present ({summary.present_today})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600" />
                  <span className="text-xs text-gray-600">Absent ({summary.absent_today})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-600" />
                  <span className="text-xs text-gray-600">Unmarked ({summary.unmarked_today})</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No attendance data</p>
          )}
        </div>

        {/* Department Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Employees by Department</h2>
          {departments.length > 0 ? (
            <ResponsiveContainer width="100%" height={departments.length * 44 + 20}>
              <BarChart data={departments} layout="vertical" margin={{ left: 0, right: 20 }}
                onClick={(data) => {
                  if (data?.activeLabel) navigate("/employees?search=" + encodeURIComponent(data.activeLabel));
                }}
                style={{ cursor: "pointer" }}
              >
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="department" width={110} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0D9488" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No department data</p>
          )}
        </div>
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
                      to={`/attendance?employee=${emp.employee_id}`}
                      onClick={() => setDetailModal(null)}
                      className="text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors"
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
