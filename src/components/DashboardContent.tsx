"use client";

import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API calls

interface DashboardContentProps {
  user: {
    username: string;
    email: string;
    role: string;
  } | null;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState<any>(null); // State for quick stats

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Fetch quick stats from the API
    const fetchQuickStats = async () => {
      try {
        const response = await axios.get("/api/quick-stats");
        setQuickStats(response.data);
      } catch (error) {
        console.error("Error fetching quick stats:", error);
      }
    };

    fetchQuickStats(); // Call the function to fetch stats
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
        Welcome, {user?.username || "Guest"}
      </h3>

      <div className="mt-8">
        <h4 className="text-2xl font-semibold text-[#333333]">Quick Stats</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
          <div className="flex items-center px-5 py-6 shadow-lg rounded-lg bg-white border border-[#D9CFF5]">
            <div className="mx-5">
              <h4 className="text-2xl font-semibold text-[#333333]">
                {quickStats?.totalServices || 0}
              </h4>
              <div className="text-[#6B4FA0]">Total Product Categorys</div>
            </div>
          </div>
          <div className="flex items-center px-5 py-6 shadow-lg rounded-lg bg-white border border-[#D9CFF5]">
            <div className="mx-5">
              <h4 className="text-2xl font-semibold text-[#333333]">
                {quickStats?.totalProducts || 0}
              </h4>
              <div className="text-[#6B4FA0]">Total Products</div>
            </div>
          </div>
          <div className="flex items-center px-5 py-6 shadow-lg rounded-lg bg-white border border-[#D9CFF5]">
            <div className="mx-5">
              <h4 className="text-2xl font-semibold text-[#333333]">
                {quickStats?.totalBrands || 0}
              </h4>
              <div className="text-[#6B4FA0]">Total Brands</div>
            </div>
          </div>
          <div className="flex items-center px-5 py-6 shadow-lg rounded-lg bg-white border border-[#D9CFF5]">
            <div className="mx-5">
              <h4 className="text-2xl font-semibold text-[#333333]">
                {quickStats?.totalStockInEntries || 0}
              </h4>
              <div className="text-[#6B4FA0]">Total Stock In Entries</div>
            </div>
          </div>
          <div className="flex items-center px-5 py-6 shadow-lg rounded-lg bg-white border border-[#D9CFF5]">
            <div className="mx-5">
              <h4 className="text-2xl font-semibold text-[#333333]">
                {quickStats?.totalStockOutEntries || 0}
              </h4>
              <div className="text-[#6B4FA0]">Total Stock Out Entries</div>
            </div>
          </div>
          <div className="flex items-center px-5 py-6 shadow-lg rounded-lg bg-white border border-[#D9CFF5]">
            <div className="mx-5">
              <h4 className="text-2xl font-semibold text-[#333333]">
                {quickStats?.lowStockProducts || 0}
              </h4>
              <div className="text-[#6B4FA0]">Low Stock Products</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
