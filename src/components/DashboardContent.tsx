"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUsers,
  FaBox,
  FaCalculator,
  FaArrowUp,
  FaArrowDown,
  FaExclamationCircle,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

interface DashboardContentProps {
  user: {
    username: string;
    email: string;
    role: string;
  } | null;
}

interface QuickStats {
  totalServices: number;
  totalProducts: number;
  totalBrands: number;
  totalStockInEntries: number;
  totalStockOutEntries: number;
  lowStockProducts: number;
  stockInQuantity: number;
  stockOutQuantity: number;
  totalStockInValue: number;
  totalStockOutValue: number;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    const fetchQuickStats = async () => {
      try {
        const response = await axios.get("/api/quick-stats");
        setQuickStats(response.data);
      } catch (error) {
        console.error("Error fetching quick stats:", error);
      }
    };

    fetchQuickStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-10 w-1 bg-indigo-600 rounded-full"></div>
          <h3 className="text-3xl font-bold text-gray-800 tracking-tight">
            Welcome back, <span className="text-indigo-600">{user?.username || "Guest"}</span>
          </h3>
        </div>

        <div className="space-y-6">
          <section>
            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-indigo-100 p-1.5 rounded-lg mr-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
              Quick Stats
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                onClick={() => router.push("/service-list")}
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white rounded-xl p-4 border border-gray-100 shadow-md cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FaUsers className="text-2xl text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-800">{quickStats?.totalServices || 0}</p>
                    <p className="text-sm text-gray-600">Product Categories</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => router.push("/product-list")}
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white rounded-xl p-4 border border-gray-100 shadow-md cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <FaBox className="text-2xl text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-800">{quickStats?.totalProducts || 0}</p>
                    <p className="text-sm text-gray-600">Total Products</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => router.push("/brand-management")}
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white rounded-xl p-4 border border-gray-100 shadow-md cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <FaCalculator className="text-2xl text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-800">{quickStats?.totalBrands || 0}</p>
                    <p className="text-sm text-gray-600">Total Brands</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => router.push("/stock-in")}
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white rounded-xl p-4 border border-gray-100 shadow-md cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <FaArrowUp className="text-2xl text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-800">{quickStats?.totalStockInEntries || 0}</p>
                    <p className="text-sm text-gray-600">Stock In Entries</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => router.push("/stock-out")}
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white rounded-xl p-4 border border-gray-100 shadow-md cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <FaArrowDown className="text-2xl text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-800">{quickStats?.totalStockOutEntries || 0}</p>
                    <p className="text-sm text-gray-600">Stock Out Entries</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => router.push("/current-stock")}
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-white rounded-xl p-4 border border-gray-100 shadow-md cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <FaExclamationCircle className="text-2xl text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-800">{quickStats?.lowStockProducts || 0}</p>
                    <p className="text-sm text-gray-600">Low Stock Products</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
{/* 
          <section>
            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-indigo-100 p-1.5 rounded-lg mr-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              Stock Overview
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FaArrowUp className="text-green-600 mr-2" />
                  Stock In Summary
                </h5>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total Items Received</span>
                    <span className="text-xl font-bold text-gray-800">{quickStats?.stockInQuantity || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Investment</span>
                    <span className="text-xl font-bold text-green-600">{(quickStats?.totalStockInValue || 0).toLocaleString()} Tk</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FaArrowDown className="text-red-600 mr-2" />
                  Stock Out Summary
                </h5>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total Items Issued</span>
                    <span className="text-xl font-bold text-gray-800">{quickStats?.stockOutQuantity || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Value</span>
                    <span className="text-xl font-bold text-blue-600">{(quickStats?.totalStockOutValue || 0).toLocaleString()} Tk</span>
                  </div>
                </div>
              </div>
            </div>
          </section> */}
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
