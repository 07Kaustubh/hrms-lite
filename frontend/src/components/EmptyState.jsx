export default function EmptyState({
  icon = "📭",
  title,
  description,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 border border-gray-200 py-16 px-6">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500 max-w-sm text-center">
          {description}
        </p>
      )}
    </div>
  );
}
