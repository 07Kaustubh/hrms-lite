import { NavLink, Link, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { LayoutDashboard, Users, ClipboardCheck, Sun, Moon } from "lucide-react";
import Logo from "./Logo";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/attendance", label: "Attendance", icon: ClipboardCheck },
];

export default function Sidebar({ isOpen, onClose, dark, toggle }) {
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
        w-64 bg-white dark:bg-slate-800 text-gray-800 dark:text-white flex flex-col min-h-screen border-r border-gray-200 dark:border-transparent
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}>
        <Link to="/" className="px-6 py-5 flex items-center gap-3 border-b border-gray-200 dark:border-slate-700/50 bg-gray-50 dark:bg-gradient-to-r dark:from-slate-900 dark:to-slate-800 hover:bg-gray-100 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all">
          <Logo className="w-7 h-7" />
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
                    ? "bg-teal-600/10 dark:bg-teal-600/20 text-teal-700 dark:text-teal-400 border-l-2 border-teal-600 dark:border-teal-400"
                    : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 mt-auto mb-2">
          <button
            onClick={toggle}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <div className="px-6 py-4 text-xs text-gray-400 dark:text-slate-500 border-t border-gray-200 dark:border-slate-700">
          &copy; 2026 HRMS Lite
        </div>
      </aside>
    </>
  );
}
