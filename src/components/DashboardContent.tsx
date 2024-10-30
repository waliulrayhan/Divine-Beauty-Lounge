'use client';

import React, { useState, useEffect } from 'react';

interface DashboardContentProps {
  user: {
    username: string;
    email: string;
    role: string;
  } | null;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6B4FA0]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 bg-[#FAF8F5]">
      <h3 className="text-[#333333] text-3xl font-medium">
        Welcome, {user?.username || 'Guest'}
      </h3>
      <div className="mt-4">
        <div className="flex flex-wrap -mx-6">
          <div className="w-full px-6 sm:w-1/2 xl:w-1/3">
            <div className="flex items-center px-5 py-6 shadow-lg rounded-lg bg-white border border-[#D9CFF5] hover:shadow-xl transition-shadow duration-300">
              <div className="p-3 rounded-full bg-gradient-to-r from-[#6B4FA0] to-[#4C306D]">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="mx-5">
                <h4 className="text-2xl font-semibold text-[#333333]">156</h4>
                <div className="text-[#6B4FA0]">Active Orders</div>
              </div>
            </div>
          </div>
          <div className="w-full mt-6 px-6 sm:w-1/2 xl:w-1/3 sm:mt-0">
            <div className="flex items-center px-5 py-6 shadow-lg rounded-lg bg-white border border-[#D9CFF5] hover:shadow-xl transition-shadow duration-300">
              <div className="p-3 rounded-full bg-gradient-to-r from-[#6B4FA0] to-[#4C306D]">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mx-5">
                <h4 className="text-2xl font-semibold text-[#333333]">$45,250</h4>
                <div className="text-[#6B4FA0]">Monthly Revenue</div>
              </div>
            </div>
          </div>
          <div className="w-full mt-6 px-6 sm:w-1/2 xl:w-1/3 xl:mt-0">
            <div className="flex items-center px-5 py-6 shadow-lg rounded-lg bg-white border border-[#D9CFF5] hover:shadow-xl transition-shadow duration-300">
              <div className="p-3 rounded-full bg-gradient-to-r from-[#6B4FA0] to-[#4C306D]">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div className="mx-5">
                <h4 className="text-2xl font-semibold text-[#333333]">1,423</h4>
                <div className="text-[#6B4FA0]">Products in Stock</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
