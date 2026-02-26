import { NavLink, Link, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Briefcase, LayoutDashboard, Users, ClipboardCheck } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/attendance", label: "Attendance", icon: ClipboardCheck },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const prevPathRef = useRef(location.pathname);

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      onCloseRef.current?.();
    }
  }, [location.pathname]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-indigo-700 text-white flex flex-col min-h-screen
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}>
        <Link to="/" className="px-6 py-5 flex items-center gap-3 border-b border-indigo-600/50 bg-gradient-to-r from-indigo-800 to-indigo-700 hover:from-indigo-700 hover:to-indigo-600 transition-all">
          <Briefcase className="w-7 h-7" />
          <h1 className="text-xl font-bold tracking-wide">HRMS Lite</h1>
        </Link>

        <nav className="flex-1 mt-4 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-indigo-100 hover:bg-white/10"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 text-xs text-indigo-300 border-t border-indigo-600">
          &copy; 2026 HRMS Lite
        </div>
      </aside>
    </>
  );
}
