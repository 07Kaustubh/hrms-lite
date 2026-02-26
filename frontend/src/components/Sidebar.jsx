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
        w-64 bg-slate-800 text-white flex flex-col min-h-screen
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}>
        <Link to="/" className="px-6 py-5 flex items-center gap-3 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 transition-all">
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
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-700/50"
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
            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <div className="px-6 py-4 text-xs text-slate-500 border-t border-slate-700">
          &copy; 2026 HRMS Lite
        </div>
      </aside>
    </>
  );
}
