export default function StatusBadge({ status }) {
  const isPresent = status === "Present";

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
        isPresent
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {status}
    </span>
  );
}
