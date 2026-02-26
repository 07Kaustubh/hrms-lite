import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-6">
        <SearchX className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">404</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
        Back to Dashboard
      </Link>
    </div>
  );
}
