"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

interface DashboardProps {
  user: any;
  children: React.ReactNode;
}

export default function Dashboard({ user, children }: DashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-indigo-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition duration-200 ease-in-out z-20`}
      >
        <nav>
          <Link
            href="/dashboard"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-700"
          >
            Dashboard
          </Link>
          <Link
            href="/service-list"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-700"
          >
            Service List
          </Link>
          <Link
            href="/product-list"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-700"
          >
            Product List
          </Link>
          <a
            href="#"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-700"
          >
            Stock In
          </a>
          <a
            href="#"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-700"
          >
            Stock Out
          </a>
          {user.role === 'SUPER_ADMIN' && (
            <Link
              href="/user-management"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-700"
            >
              User Management
            </Link>
          )}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className="bg-white shadow-lg z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="text-gray-500 focus:outline-none focus:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <div className="ml-4 flex-shrink-0 flex items-center">
                  <h1 className="text-2xl font-bold text-indigo-600">
                    Dashboard
                  </h1>
                </div>
              </div>
              <div className="flex items-center">
                <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span className="sr-only">View notifications</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          {children}
        </main>
      </div>
    </div>
  );
}
