"use client";

import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API calls
import { FaUsers, FaBox, FaCalculator, FaArrowUp, FaArrowDown, FaExclamationCircle } from 'react-icons/fa'; // Import icons for interactive UI

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
      <div className="flex items-center justify-center min-h-screen bg-soft-pink">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deep-purple"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 bg-soft-pink">
      <h3 className="text-3xl font-medium mb-4 text-gray-800">
        Welcome, {user?.username || "Guest"}
      </h3>

      <div className="mt-8">
        <h4 className="text-2xl font-semibold text-gray-800 mb-4">Quick Stats</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          <div className="flex items-center px-5 py-6 shadow-lg rounded-lg bg-white border border-gray-200">
            <FaUsers className="text-4xl text-blue-500 mr-4" /> {/* Changed icon color to a relevant user color */}
            <div className="mx-5">
              <h4 className="text-2xl font-semibold text-gray-700"> {/* Changed text color to a darker shade */}
                {quickStats?.totalServices || 0}
              </h4>
              <div className="text-gray-700"> {/* Changed text color to a darker shade */}
                Total Product Categorys
              </div>
            </div>
          </div>
          <div className="flex items-center px-5 py-6 shadow-lg rounded-lg bg-white border border-gray-200">
            <FaBox className="text-4xl text-blue-500 mr-4" /> {/* Changed icon color to a relevant box color */}
            <div className="mx-5">
              <h4 className="text-2xl font-semibold text-gray-700"> {/* Changed text color to a darker shade */}
                {quickStats?.totalProducts || 0}
              </h4>
              <div className="text-gray-700"> {/* Changed text color to a darker shade */}
                Total Products
              </div>
            </div>
          </div>
          <div className="flex items-center px-5 py-6 shadow-lg rounded-lg bg-white border border-gray-200">
            <FaCalculator className="text-4xl text-green-500 mr-4" /> {/* Changed icon color to a relevant green color */}
            <div className="mx-5">
              <h4 className="text-2xl font-semibold text-gray-700"> {/* Changed text color to a darker shade */}
                {quickStats?.totalBrands || 0}
              </h4>
              <div className="text-gray-700"> {/* Changed text color to a darker shade */}
                Total Brands
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          <div className="flex items-center px-5 py-6 shadow-lg rounded-lg bg-white border border-gray-200">
            <FaArrowUp className="text-4xl text-green-500 mr-4" /> {/* Changed icon color to a relevant green color */}
            <div className="mx-5">
              <h4 className="text-2xl font-semibold text-gray-700"> {/* Changed text color to a darker shade */}
                {quickStats?.totalStockInEntries || 0}
              </h4>
              <div className="text-gray-700"> {/* Changed text color to a darker shade */}
                Total Stock In Entries
              </div>
            </div>
          </div>
          <div className="flex items-center px-5 py-6 shadow-lg rounded-lg bg-white border border-gray-200">
            <FaArrowDown className="text-4xl text-red-500 mr-4" /> {/* Changed icon color to a relevant red color */}
            <div className="mx-5">
              <h4 className="text-2xl font-semibold text-gray-700"> {/* Changed text color to a darker shade */}
                {quickStats?.totalStockOutEntries || 0}
              </h4>
              <div className="text-gray-700"> {/* Changed text color to a darker shade */}
                Total Stock Out Entries
              </div>
            </div>
          </div>
          <div className="flex items-center px-5 py-6 shadow-lg rounded-lg bg-white border border-gray-200">
            <FaExclamationCircle className="text-4xl text-yellow-500 mr-4" /> {/* Changed icon color to a relevant yellow color */}
            <div className="mx-5">
              <h4 className="text-2xl font-semibold text-gray-700"> {/* Changed text color to a darker shade */}
                {quickStats?.lowStockProducts || 0}
              </h4>
              <div className="text-gray-700"> {/* Changed text color to a darker shade */}
                Low Stock Products
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
