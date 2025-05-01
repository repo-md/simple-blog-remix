import { Link } from "@remix-run/react";

interface ErrorBoundaryProps {
  status?: number;
  statusText?: string;
  message?: string;
}

export default function ErrorBoundary({
  status = 500,
  statusText = "Server Error",
  message = "Something went wrong when loading this page."
}: ErrorBoundaryProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">{status}</h1>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{statusText}</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">{message}</p>
        <Link
        prefetch="viewport" 
          to="/"
          className="inline-block px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}