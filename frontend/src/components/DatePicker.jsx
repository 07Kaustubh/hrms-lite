import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { format, parse } from "date-fns";
import { Calendar } from "lucide-react";
import "react-day-picker/style.css";

export default function DatePicker({ value, onChange, max, id, name }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const maxDate = max ? parse(max, "yyyy-MM-dd", new Date()) : undefined;

  const handleSelect = (day) => {
    if (day) {
      onChange({ target: { name: name || "date", value: format(day, "yyyy-MM-dd") } });
      setOpen(false);
    }
  };

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setOpen(!open);
  };

  return (
    <div className="relative">
      <button
        type="button"
        id={id}
        ref={btnRef}
        onClick={handleOpen}
        className={`w-full border rounded-lg px-3 py-2 text-left text-sm outline-none transition-shadow flex items-center justify-between dark:bg-gray-800 dark:text-gray-100 ${
          open ? "ring-2 ring-teal-500 border-teal-500" : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        }`}
      >
        <span className={value ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}>
          {value ? format(parse(value, "yyyy-MM-dd", new Date()), "MMM d, yyyy") : "Select a date"}
        </span>
        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      </button>
      {open && createPortal(
        <div
          ref={ref}
          className="fixed z-[100] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg"
          style={{ top: pos.top, left: pos.left, minWidth: Math.min(pos.width, 320) }}
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            disabled={maxDate ? { after: maxDate } : undefined}
            className="p-2 sm:p-3"
            style={{ fontSize: "0.85rem" }}
          />
        </div>,
        document.body
      )}
    </div>
  );
}
