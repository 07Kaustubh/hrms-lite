export default function StatusBadge({ status }) {
  const isPresent = status === "Present";

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
        isPresent
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
      }`}
    >
      {status}
    </span>
  );
}
