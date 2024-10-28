"use client";

import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardProps {
  user: any;
  children: React.ReactNode;
}

export default function Dashboard({ user, children }: DashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load sidebar state on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState !== null) {
      setIsSidebarOpen(JSON.parse(savedState));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem('sidebarState', JSON.stringify(newState));
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div
        className={`bg-gradient-to-b from-indigo-900 to-indigo-800 text-white ${
          isSidebarOpen ? 'w-72' : 'w-20'
        } space-y-2 py-8 px-4 absolute inset-y-0 left-0 transform md:relative transition-all duration-200 ease-in-out z-20 shadow-xl`}
      >
        <div className={`px-4 mb-8 ${!isSidebarOpen && 'text-center'}`}>
          {isSidebarOpen ? (
            <h2 className="text-2xl font-bold text-white mb-2">Admin Panel</h2>
          ) : (
            <div className="flex justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
          <div className={`h-1 bg-indigo-500 rounded-full ${isSidebarOpen ? 'w-16' : 'w-8 mx-auto'}`}></div>
        </div>
        
        <nav className="space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center px-4 py-3 text-gray-100 rounded-lg transition-all duration-200 hover:bg-indigo-700 hover:shadow-md group"
          >
            <span className="inline-block mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </span>
            <span className={`${!isSidebarOpen && 'hidden'}`}>Dashboard</span>
          </Link>
          
          <Link
            href="/service-list"
            className="flex items-center px-4 py-3 text-gray-100 rounded-lg transition-all duration-200 hover:bg-indigo-700 hover:shadow-md group"
          >
            <span className="inline-block mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <span className={`${!isSidebarOpen && 'hidden'}`}>Service List</span>
          </Link>

          <Link
            href="/product-list"
            className="flex items-center px-4 py-3 text-gray-100 rounded-lg transition-all duration-200 hover:bg-indigo-700 hover:shadow-md group"
          >
            <span className="inline-block mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
            <span className={`${!isSidebarOpen && 'hidden'}`}>Product List</span>
          </Link>

          <Link
            href="/stock-in"
            className="flex items-center px-4 py-3 text-gray-100 rounded-lg transition-all duration-200 hover:bg-indigo-700 hover:shadow-md group"
          >
            <span className="inline-block mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
              </svg>
            </span>
            <span className={`${!isSidebarOpen && 'hidden'}`}>Stock In</span>
          </Link>

          <Link
            href="/stock-out"
            className="flex items-center px-4 py-3 text-gray-100 rounded-lg transition-all duration-200 hover:bg-indigo-700 hover:shadow-md group"
          >
            <span className="inline-block mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
              </svg>
            </span>
            <span className={`${!isSidebarOpen && 'hidden'}`}>Stock Out</span>
          </Link>

          <Link
            href="/current-stock"
            className="flex items-center px-4 py-3 text-gray-100 rounded-lg transition-all duration-200 hover:bg-indigo-700 hover:shadow-md group"
          >
            <span className="inline-block mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            <span className={`${!isSidebarOpen && 'hidden'}`}>Current Stock</span>
          </Link>

          {user.role === 'SUPER_ADMIN' && (
            <Link
              href="/user-management"
              className="flex items-center px-4 py-3 text-gray-100 rounded-lg transition-all duration-200 hover:bg-indigo-700 hover:shadow-md group"
            >
              <span className="inline-block mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
              <span className={`${!isSidebarOpen && 'hidden'}`}>User Management</span>
            </Link>
          )}

          {user.role === 'NORMAL_ADMIN' && (
            <Link
              href="/users"
              className="flex items-center px-4 py-3 text-gray-100 rounded-lg transition-all duration-200 hover:bg-indigo-700 hover:shadow-md group"
            >
              <span className="inline-block mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
              <span className={`${!isSidebarOpen && 'hidden'}`}>Users</span>
            </Link>
          )}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className="bg-white shadow-md z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
                <div className="ml-6">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">
                  {user.email || user.username || 'User'}
                </span>
                
                <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative">
                  <span className="sr-only">View notifications</span>
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
