import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <span className="text-6xl mb-4">🔍</span>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
