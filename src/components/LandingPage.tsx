"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My App</h1>
          <Link
            href="/login"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Log In
          </Link>
        </div>
      </header>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-semibold text-gray-900">Welcome to My App</h2>
            <p className="mt-4 text-gray-600">
              This is a simple landing page for users who are not logged in.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
