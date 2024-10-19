"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-indigo-600">My App</h1>
          <Link
            href="/login"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
          >
            Log In
          </Link>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Welcome to My App</h2>
          <p className="text-xl text-gray-600 mb-8">
            Discover a new way to manage your tasks and boost your productivity.
          </p>
          <Link
            href="/login"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out"
          >
            Get Started
          </Link>
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Beauty IMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
